# app.py: recommendation-server using FastAPI

import io
import os
import pickle
from collections import defaultdict
from typing import Optional

import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from surprise import SVD, Dataset, Reader, dump
from surprise.model_selection import GridSearchCV

app = FastAPI(
    title="Recommendation API",
    description="API for training and using a recommendation engine",
    version="1.0.0",
)

# CORS設定
origins = [
    "http://localhost:3000",  # Reactのデフォルト開発環境URL
    "https://sushi-go-round.taniii.com",
    "http://sushi-go-round.taniii.com",
    # 必要に応じて本番環境URLを追加
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# グローバル変数
data = None
loaded_algo = None
predictions = None
trainset = None


class TrainParams(BaseModel):
    use_sample_data: bool = False
    cv_value: Optional[int] = None
    tune: bool = False
    model_filename: str = "model.pkl"


def hyperparameter_tuning(data, cv_value):
    param_grid = {
        "n_epochs": [5, 10, 20, 50],
        "lr_all": [0.002, 0.005, 0.01],
        "reg_all": [0.02, 0.1, 0.2, 0.4, 0.6],
        "n_factors": [50, 100, 200],
    }
    gs = GridSearchCV(SVD, param_grid, measures=["rmse", "mae"], cv=cv_value)
    gs.fit(data)
    return gs.best_params


def get_top_n(predictions, n=10):
    rows = []
    user_ratings = defaultdict(list)

    for uid, iid, true_r, est, _ in predictions:
        user_ratings[uid].append((iid, est))

    for uid, ratings in user_ratings.items():
        ratings.sort(key=lambda x: x[1], reverse=True)
        top_ratings = ratings[:n]
        for iid, est in top_ratings:
            rows.append([uid, iid, est])

    return pd.DataFrame(rows, columns=["User", "Item", "Estimate"])


@app.on_event("startup")
async def load_default_model():
    """
    サーバ起動時に,
    1. model.pklが存在する場合はロードを行う.
       - trainset.pklが存在しない場合は新規ユーザ対応ができない旨を表示.
    2. model.pklが存在しない場合はサンプルデータで新規学習を行い, model.pklおよびtrainset.pklを作成する.
    """
    global predictions, loaded_algo, trainset, data

    model_path = "model.pkl"
    trainset_path = "trainset.pkl"

    if os.path.exists(model_path):
        # モデルが存在するならロード
        try:
            predictions, loaded_algo = dump.load(model_path)
            print("デフォルトモデル(model.pkl)がロードされました.")
            # trainset.pklが存在すればロード
            if os.path.exists(trainset_path):
                with open(trainset_path, "rb") as f:
                    trainset = pickle.load(f)
                print("trainset.pklがロードされました. 新規ユーザ対応が可能です.")
            else:
                # trainsetなし
                print("trainset.pklが存在しません. 新規ユーザ対応はできません.")
        except Exception as e:
            print(f"モデルのロード中にエラーが発生しました: {e}")
    else:
        # モデルがなければ新規学習を行う(サンプルデータ使用)
        print("モデルが存在しないため, サンプルデータで新規学習を行います.")
        data = Dataset.load_builtin("ml-100k")

        # 学習処理
        algo = SVD()
        trainset = data.build_full_trainset()
        algo.fit(trainset)
        testset = trainset.build_anti_testset()
        predictions = algo.test(testset)

        # モデル保存
        dump.dump(model_path, predictions=predictions, algo=algo)
        with open(trainset_path, "wb") as f:
            pickle.dump(trainset, f)

        loaded_algo = algo
        print("モデルとtrainsetが学習・保存されました.")


@app.post("/upload-data", summary="データのアップロード")
async def upload_data(
    file: Optional[UploadFile] = File(None), use_sample_data: bool = Form(False)
):
    """
    データセットをアップロードまたはサンプルデータセットを利用します.
    CSVをアップロードするか, use_sample_data=Trueでサンプルを利用できます.
    """
    global data
    if use_sample_data:
        # Surprise組み込みのml-100kデータを使用
        data = Dataset.load_builtin("ml-100k")
    else:
        if file is None:
            raise HTTPException(
                status_code=400,
                detail="ファイルがアップロードされていません. またはuse_sample_data=Trueを使用してください.",
            )
        # CSVを読み込み
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        if not {"user_id", "item_id", "rating"}.issubset(df.columns):
            raise HTTPException(
                status_code=400,
                detail="CSVにはuser_id, item_id, ratingカラムが必要です.",
            )
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(df[["user_id", "item_id", "rating"]], reader)
    return JSONResponse(content={"message": "データが正常に読み込まれました."})


@app.post("/train-model", summary="モデルの学習")
async def train_model(params: TrainParams):
    """
    モデルを学習します.
    use_sample_data=Trueでサンプルデータ使用
    tune=Trueでハイパーパラメータチューニングを実施 (cv_valueを指定)
    model_filenameでモデル保存名を指定
    """
    global data, predictions, loaded_algo, trainset
    if data is None:
        raise HTTPException(
            status_code=400, detail="先にデータをアップロードしてください."
        )

    # チューニング
    if params.tune:
        if not params.cv_value or params.cv_value < 2:
            raise HTTPException(
                status_code=400, detail="チューニングにはcv_value(2以上)が必要です."
            )
        best_params = hyperparameter_tuning(data, params.cv_value)
        algo = SVD(**best_params["rmse"])
    else:
        # チューニングしない場合はデフォルトのSVD
        algo = SVD()

    trainset = data.build_full_trainset()
    algo.fit(trainset)
    testset = trainset.build_anti_testset()
    predictions = algo.test(testset)
    dump.dump(params.model_filename, predictions=predictions, algo=algo)

    # trainsetも保存
    with open("trainset.pkl", "wb") as f:
        pickle.dump(trainset, f)

    loaded_algo = algo

    return JSONResponse(
        content={
            "message": f"モデルが学習され, {params.model_filename} と trainset.pkl が保存されました."
        }
    )


@app.post("/load-model", summary="学習済みモデルのロード")
async def load_model(file: UploadFile = File(...)):
    """
    学習済みモデルファイル(pkl)をアップロードしてロードします.
    """
    global predictions, loaded_algo, trainset
    if file.content_type not in [
        "application/octet-stream",
        "application/x-pickle",
        "application/vnd.pickle",
    ]:
        raise HTTPException(
            status_code=400, detail="pklファイルをアップロードしてください."
        )

    temp_path = "temp_model.pkl"
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    predictions, loaded_algo = dump.load(temp_path)

    # trainset.pklの存在チェック
    trainset_path = "trainset.pkl"
    if os.path.exists(trainset_path):
        with open(trainset_path, "rb") as f:
            trainset = pickle.load(f)
        return JSONResponse(
            content={
                "message": "モデルがロードされ, trainsetも利用可能です. 新規ユーザ対応が可能です."
            }
        )
    else:
        return JSONResponse(
            content={
                "message": "モデルはロードされましたが, trainsetが存在しないため新規ユーザ対応はできません."
            }
        )


@app.get("/recommend-existing", summary="既存ユーザへのレコメンド")
async def recommend_existing(n: int = 10):
    """
    既存ユーザに対するトップNのレコメンドを返します.
    """
    global predictions
    if predictions is None:
        raise HTTPException(
            status_code=400, detail="先にモデルを学習またはロードしてください."
        )
    top_n_df = get_top_n(predictions, n=n)
    # JSONで返す
    return top_n_df.to_dict(orient="records")


@app.post("/recommend-new", summary="新規ユーザへのレコメンド")
async def recommend_new(file: UploadFile = File(...), n: int = 10):
    """
    新規ユーザ評価データCSVをアップロードし, トップNレコメンドを返します.
    CSVにはuser_id, item_id, ratingが必要です.
    """
    global lo
