# server.py
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from surprise import Dataset, KNNBaseline, Reader

app = Flask(__name__)
CORS(app)  # これで全エンドポイントに対して CORS を許可

# 学習用CSV (user_id, item_id, rating) があるパス
TRAIN_DATA_PATH = "./data/sushi_dataset_filtered_v2_for_surprise.csv"


# Surpriseで学習データの用意
def load_dataset():
    df = pd.read_csv(TRAIN_DATA_PATH)
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[["user_id", "item_id", "rating"]], reader)
    return data


# グローバルでKNNBaselineを学習済みにしておく (1回ロード)
data = load_dataset()
trainset = data.build_full_trainset()
algo = KNNBaseline()
algo.fit(trainset)


@app.route("/")
def hello():
    return "Sushi Recommendation API is running."


@app.route("/recommend", methods=["POST"])
def recommend():
    # JSONで { user_id: string, ratings: [{item_id, rating}, ...] } の形式を受け取る想定
    content = request.json
    user_id = content["user_id"]
    user_ratings = content["ratings"]  # [{item_id, rating}, ...]

    # まず, ユーザが評価した5件をアルゴリズムに反映 (「即時学習」アプローチ)
    # 簡易的には, trainsetを一度再構築するなど方法はいくつかあるが,
    # 大規模になると工夫が必要 (ここではあくまでサンプル)
    # ---------------------------------------------------------
    # 1) 今回は KNNBaseline の trainset に add するのは簡単ではないので,
    #    疑似的に "仮想ユーザ" の評価として推定計算をする方法で実装.
    # 2) どうしても incremental learning したいなら, 既存データ + ユーザ評価分を
    #    dfに追記 → 新たに build_full_trainset して fit() する必要がある.

    # ここでは "仮のユーザ" として rating をアルゴリズムに反映するのではなく,
    # Surpriseのpredict() を直接使って "このユーザID" で "item_id" に対して
    # スコアを見て上位をピックアップする流れを示す.
    # ---------------------------------------------------------

    # 既存の trainset に user_id がない場合には, Surprise上は "unknown user" 扱い
    # => predict() は平均値を返す (KNNBaselineの場合)
    # ただ, ここではあくまでサンプルなので, そのままpredict() を連打して
    # 全アイテムの推定スコアを取得し, 上位10件を抽出する方法をとる

    # trainset.all_items() は内部ID, raw_idへのマッピングがある
    # raw_idを取得して for ループで predict する
    all_items = [trainset.to_raw_iid(i) for i in trainset.all_items()]
    predictions = []
    for item in all_items:
        pred = algo.predict(user_id, item)  # user_id, item_id
        predictions.append((item, pred.est))  # (アイテムID, 推定評価)

    # 推定評価の高い順にソートし, 上位10件を取得
    recommendations = sorted(predictions, key=lambda x: x[1], reverse=True)[:10]

    # JSONで返す { item_id, score } の形を整形
    result = []
    for item_id, score in recommendations:
        result.append({"item_id": item_id, "score": score})

    return jsonify(result)


def calculate_ndcg(ratings, predicted_scores):
    dcg = np.sum((2**ratings - 1) / np.log2(np.arange(1, len(ratings) + 1) + 1))
    idcg = np.sum(
        (2 ** sorted(ratings, reverse=True) - 1)
        / np.log2(np.arange(1, len(ratings) + 1) + 1)
    )
    return dcg / idcg


@app.route("/api/recommendation/ratings", methods=["POST"])
def log_ratings():
    data = request.json
    ratings = data.get("ratings")
    if not ratings or len(ratings) != 5:
        return jsonify({"error": "Invalid ratings data"}), 400

    # Assuming predicted_scores are available
    predicted_scores = [4, 3, 5, 2, 1]  # Example predicted scores
    ndcg_score = calculate_ndcg(ratings, predicted_scores)
    app.logger.info(f"NDCG Score: {ndcg_score}")

    return jsonify({"message": "Ratings received", "ndcg_score": ndcg_score})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
