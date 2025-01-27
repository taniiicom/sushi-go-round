from collections import defaultdict

import pandas as pd
import streamlit as st
from surprise import SVD, Dataset, Reader, dump
from surprise.model_selection import GridSearchCV


def main():
    # StreamlitのUI設定
    st.title("レコメンドWebアプリ")
    menu = ["レコメンドエンジン学習機能", "レコメンド実施機能"]
    choice = st.sidebar.selectbox("メニュー", menu)
    # ユーザーの選択に応じて機能を切り替え
    if choice == "レコメンドエンジン学習機能":
        recommend_engine_learning()
    else:
        recommend_execution()


def load_data():
    # データのロード機能
    data_source = st.radio(
        "データソースの選択", ["CSVファイル", "サンプルデータ(ml-100k)"]
    )
    if data_source == "サンプルデータ(ml-100k)":
        return Dataset.load_builtin("ml-100k")

    uploaded_file = st.file_uploader("CSVファイルを選択してください", type="csv")
    if uploaded_file:
        df = pd.read_csv(uploaded_file)
        reader = Reader(rating_scale=(1, 5))
        return Dataset.load_from_df(df[["user_id", "item_id", "rating"]], reader)


def hyperparameter_tuning(data, cv_value):
    # ハイパーパラメータのチューニング機能
    param_grid = {
        "n_epochs": [5, 10, 20, 50],
        "lr_all": [0.002, 0.005, 0.01],
        "reg_all": [0.02, 0.1, 0.2, 0.4, 0.6],
        "n_factors": [50, 100, 200],
    }
    gs = GridSearchCV(SVD, param_grid, measures=["rmse", "mae"], cv=cv_value)
    gs.fit(data)
    return gs.best_params


def train_and_save_model(data, cv_value=0):
    # モデルの学習と保存機能
    save_path = st.text_input("保存するファイル名を入力してください", "model.pkl")

    if st.button("学習&amp;保存"):
        with st.spinner("学習中..."):
            if cv_value > 1:
                best_params = hyperparameter_tuning(data, cv_value)
                algo = SVD(**best_params["rmse"])
            else:
                algo = SVD()
            trainset = data.build_full_trainset()
            algo.fit(trainset)
            testset = trainset.build_anti_testset()
            predictions = algo.test(testset)
            dump.dump(save_path, predictions=predictions, algo=algo)
            st.success(f"モデルを {save_path} として保存しました！")


def recommend_engine_learning():
    # レコメンドエンジンの学習機能
    st.subheader("学習データのロード")
    data = load_data()
    if data:
        st.subheader("モデルの学習")
        tuning_choice = st.radio(
            "ハイパーパラメータチューニングの選択",
            [
                "ハイパーパラメータチューニングを実施する",
                "ハイパーパラメータチューニングを実施しない",
            ],
        )
        if tuning_choice == "ハイパーパラメータチューニングを実施する":
            cv_value = st.slider(
                "CVの回数を選択してください", min_value=2, max_value=10, value=2, step=1
            )
            train_and_save_model(data, cv_value)
        else:
            train_and_save_model(data, 0)


def recommend_execution():
    # レコメンドの実施機能
    st.subheader("学習済みモデルのロード")
    predictions, loaded_algo = load_trained_model()
    st.subheader("レコメンド対象者")
    sub_menu = [
        "既存ユーザに対するレコメンドの実施",
        "新規ユーザに対するレコメンドの実施",
    ]
    choice = st.radio("オプションを選択してください", sub_menu)
    if loaded_algo:
        if choice == "既存ユーザに対するレコメンドの実施":
            recommend_existing_users(predictions, loaded_algo)
        else:
            recommend_new_users(loaded_algo)


def load_trained_model():
    # 学習済みモデルのロード機能
    uploaded_file = st.file_uploader(
        "学習済みモデルをアップロードしてください", type=["pkl"]
    )
    if uploaded_file:
        with st.spinner("処理中..."):
            with open("temp_model.pkl", "wb") as f:
                f.write(uploaded_file.read())
            predictions, loaded_algo = dump.load("temp_model.pkl")
            st.success("処理が終了しました！")
            return predictions, loaded_algo
    return None, None


def recommend_existing_users(predictions, loaded_algo):
    # 既存ユーザへのレコメンド機能
    st.subheader("既存ユーザへのレコメンド")
    with st.spinner("既存ユーザに対するレコメンド実施中..."):
        top_n_df = get_top_n(predictions, n=10)
        st.dataframe(top_n_df, width=600, height=400)
    save_filename = st.text_input(
        "保存するCSVファイル名を入力してください", "existing_user_recommendations.csv"
    )
    if st.button("結果をCSVファイルとして保存"):
        top_n_df.to_csv(save_filename, index=False)
        st.success(f"結果を {save_filename} として保存しました！")


def recommend_new_users(loaded_algo):
    # 新規ユーザのデータをアップロード
    uploaded_file = st.file_uploader(
        "新規ユーザの評価データのCSVファイルを選択してください", type="csv"
    )
    if uploaded_file:
        # アップロードされたファイルをデータフレームとして読み込む
        new_user_ratings = pd.read_csv(uploaded_file)

        # アルゴリズムから訓練データセットを取得
        trainset = loaded_algo.trainset
        unique_users = new_user_ratings["user_id"].unique()
        recommendations = []
        # サブヘッダの表示
        st.subheader("新規ユーザへのレコメンド")
        # 新規ユーザに対するレコメンドを実施
        with st.spinner("新規ユーザに対するレコメンド実施中..."):
            for user in unique_users:
                user_ratings = new_user_ratings[new_user_ratings["user_id"] == user]
                rated_items = user_ratings["item_id"].values.tolist()
                preds = []
                for iid in trainset.all_items():
                    # まだ評価されていないアイテムに対する予測を取得
                    if trainset.to_raw_iid(iid) not in rated_items:
                        preds.append(
                            (
                                user,
                                trainset.to_raw_iid(iid),
                                loaded_algo.predict(user, trainset.to_raw_iid(iid)).est,
                            )
                        )
                # 予測値の高い順にソート
                preds.sort(key=lambda x: x[2], reverse=True)
                recommendations.append(
                    pd.DataFrame(preds[:10], columns=["user_id", "item_id", "rating"])
                )
            # レコメンド結果の表示
            recommendations = pd.concat(recommendations)
            st.dataframe(recommendations, width=600, height=400)
            # レコメンド結果をCSVとして保存
            save_filename = st.text_input(
                "保存するCSVファイル名を入力してください",
                "new_user_recommendations.csv",
            )
            if st.button("結果をCSVファイルとして保存"):
                recommendations.to_csv(save_filename, index=False)
                st.success(f"結果を {save_filename} として保存しました！")


def get_top_n(predictions, n=10):
    # 予測結果から上位nのアイテムを取得する関数
    rows = []
    user_ratings = defaultdict(list)

    for uid, iid, true_r, est, _ in predictions:
        user_ratings[uid].append((iid, est))

    for uid, ratings in user_ratings.items():
        # 予測の高い順にソート
        ratings.sort(key=lambda x: x[1], reverse=True)
        top_ratings = ratings[:n]
        for iid, est in top_ratings:
            rows.append([uid, iid, est])

    return pd.DataFrame(rows, columns=["User", "Item", "Estimate"])


if __name__ == "__main__":
    # メイン関数の実行
    main()
