"use client";

import React, { useState, useEffect } from "react";
import { Box, useToast } from "@chakra-ui/react";
import ConveyorSushi from "@/components/org/ConveyorSushi";
import OrderedSushiList from "@/components/org/OrderedSushiList";

// dataset
const sushiData = [
  { id: 0, name: "えび", imageUrl: "media/sushi/0.png" },
  { id: 1, name: "穴子", imageUrl: "media/sushi/1.png" },
  { id: 3, name: "いか", imageUrl: "media/sushi/3.png" },
  { id: 5, name: "たこ", imageUrl: "media/sushi/5.png" },
  { id: 6, name: "いくら", imageUrl: "media/sushi/6.png" },
  { id: 2, name: "まぐろ", imageUrl: "media/sushi/2.png" },
  { id: 4, name: "うに", imageUrl: "media/sushi/4.png" },
  { id: 7, name: "玉子", imageUrl: "media/sushi/7.png" },
  { id: 8, name: "とろ", imageUrl: "media/sushi/8.png" },
  { id: 10, name: "ほたて貝", imageUrl: "media/sushi/10.png" },
  { id: 9, name: "甘えび", imageUrl: "media/sushi/9.png" },
  { id: 11, name: "たい", imageUrl: "media/sushi/11.png" },
  { id: 12, name: "赤貝", imageUrl: "media/sushi/12.png" },
  { id: 13, name: "はまち", imageUrl: "media/sushi/13.png" },
  { id: 14, name: "あわび", imageUrl: "media/sushi/14.png" },
  { id: 15, name: "サーモン", imageUrl: "media/sushi/15.png" },
  { id: 17, name: "しゃこ", imageUrl: "media/sushi/17.png" },
  { id: 16, name: "数の子", imageUrl: "media/sushi/16.png" },
  { id: 18, name: "さば", imageUrl: "media/sushi/18.png" },
  { id: 19, name: "中とろ", imageUrl: "media/sushi/19.png" },
  { id: 21, name: "あじ", imageUrl: "media/sushi/21.png" },
  { id: 20, name: "ひらめ", imageUrl: "media/sushi/20.png" },
  { id: 22, name: "かに", imageUrl: "media/sushi/22.png" },
  { id: 23, name: "こはだ", imageUrl: "media/sushi/23.png" },
  { id: 25, name: "うなぎ", imageUrl: "media/sushi/25.png" },
  { id: 24, name: "とり貝", imageUrl: "media/sushi/24.png" },
  { id: 26, name: "鉄火巻", imageUrl: "media/sushi/26.png" },
  { id: 27, name: "かんぱち", imageUrl: "media/sushi/27.png" },
  { id: 28, name: "みる貝", imageUrl: "media/sushi/28.png" },
  { id: 30, name: "げそ", imageUrl: "media/sushi/30.png" },
  { id: 29, name: "かっぱ巻", imageUrl: "media/sushi/29.png" },
  { id: 31, name: "かつお", imageUrl: "media/sushi/31.png" },
  { id: 33, name: "ほっき貝", imageUrl: "media/sushi/33.png" },
  { id: 34, name: "しま鯵", imageUrl: "media/sushi/34.png" },
  { id: 35, name: "かにみそ", imageUrl: "media/sushi/35.png" },
  { id: 37, name: "ねぎとろ", imageUrl: "media/sushi/37.png" },
  { id: 32, name: "いわし", imageUrl: "media/sushi/32.png" },
  { id: 38, name: "納豆巻", imageUrl: "media/sushi/38.png" },
  { id: 36, name: "えんがわ", imageUrl: "media/sushi/36.png" },
  { id: 39, name: "さより", imageUrl: "media/sushi/39.png" },
  { id: 40, name: "たくわん巻", imageUrl: "media/sushi/40.png" },
  { id: 41, name: "ぼたんえび", imageUrl: "media/sushi/41.png" },
  { id: 42, name: "とびこ", imageUrl: "media/sushi/42.png" },
  { id: 51, name: "さざえ", imageUrl: "media/sushi/51.png" },
  { id: 47, name: "たらば蟹", imageUrl: "media/sushi/47.png" },
  { id: 46, name: "すずき", imageUrl: "media/sushi/46.png" },
  { id: 50, name: "たらこ", imageUrl: "media/sushi/50.png" },
  { id: 49, name: "子持ちこんぶ", imageUrl: "media/sushi/49.png" },
  { id: 48, name: "梅しそ巻", imageUrl: "media/sushi/48.png" },
  { id: 44, name: "めんたいこ", imageUrl: "media/sushi/44.png" },
  { id: 43, name: "いなりずし", imageUrl: "media/sushi/43.png" },
  { id: 45, name: "サラダ", imageUrl: "media/sushi/45.png" },
  { id: 52, name: "あおやぎ", imageUrl: "media/sushi/52.png" },
  { id: 53, name: "とろサーモン", imageUrl: "media/sushi/53.png" },
  { id: 59, name: "あんきも", imageUrl: "media/sushi/59.png" },
  { id: 64, name: "馬さし", imageUrl: "media/sushi/64.png" },
  { id: 61, name: "ねぎとろ巻", imageUrl: "media/sushi/61.png" },
  { id: 54, name: "さんま", imageUrl: "media/sushi/54.png" },
  { id: 60, name: "かんぴょう巻", imageUrl: "media/sushi/60.png" },
  { id: 58, name: "なっとう", imageUrl: "media/sushi/58.png" },
  { id: 57, name: "白魚", imageUrl: "media/sushi/57.png" },
  { id: 63, name: "はまぐり", imageUrl: "media/sushi/63.png" },
  { id: 93, name: "からすみ", imageUrl: "media/sushi/93.png" },
  { id: 90, name: "ほや", imageUrl: "media/sushi/90.png" },
  { id: 94, name: "うにくらげ", imageUrl: "media/sushi/94.png" },
  { id: 96, name: "ひらまさ", imageUrl: "media/sushi/96.png" },
  { id: 81, name: "くえ", imageUrl: "media/sushi/81.png" },
  { id: 84, name: "くじら", imageUrl: "media/sushi/84.png" },
  { id: 86, name: "ひもきゅう巻", imageUrl: "media/sushi/86.png" },
  { id: 83, name: "ささみ", imageUrl: "media/sushi/83.png" },
];

// 推論結果を挿入しやすいように, sushiListをステート管理する
// (「5件後に挿入」などを行うため)
function App() {
  const [allSushiList, setAllSushiList] =
    useState<
      { id: number; name: string; imageUrl: string; isRecommended?: boolean }[]
    >(sushiData);

  // ユーザが注文した(下半分に表示する)すし
  const [orderedSushi, setOrderedSushi] = useState<
    { id: number; name: string; imageUrl: string }[]
  >([]);

  // ユーザがつけた評価 (すしID→評価値), 今回は5段階
  const [ratings, setRatings] = useState<Record<number, number>>({});

  const toast = useToast();

  // 寿司がクリックされたら注文リストへ追加
  const handleSushiClick = (sushi: {
    id: number;
    name: string;
    imageUrl: string;
  }) => {
    setOrderedSushi((prev) => [...prev, sushi]);
  };

  // 下半分で星がクリックされたときに評価を更新
  const handleRatingChange = (sushiId: number, rating: number) => {
    setRatings((prev) => ({ ...prev, [sushiId]: rating }));
  };

  // 5件評価が溜まったらサーバー呼び出し
  useEffect(() => {
    const ratedSushiIds = Object.keys(ratings);
    if (ratedSushiIds.length === 5) {
      // 例として固定ユーザID = "tempUser"
      fetch("http://localhost:5555/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "tempUser",
          ratings: ratedSushiIds.map((id) => ({
            item_id: id,
            rating: ratings[+id],
          })),
        }),
      })
        .then((res) => res.json())
        .then((data: { item_id: string; score: number }[]) => {
          // 推論結果をコンベアに挿入
          insertRecommendedSushi(data);
          toast({
            title: "レコメンド完了",
            description: "おすすめをコンベアに追加しました",
            status: "success",
            duration: 3000,
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [ratings]);

  // 推論結果を現在のコンベアリストの「5件後」に挿入する関数
  const insertRecommendedSushi = (
    recommendations: { item_id: string; score: number }[]
  ) => {
    // 例: ループ用に item_id, name, imageUrl を用意
    //     name, imageUrl は適宜サーバーから返すか, 事前にフロントでID→画像をマッピング
    // ここでは ID→ダミーのデータに置き換える形でサンプル実装
    // ---------------------------------------------------------
    const recommendedItems = recommendations.map((rec, idx) => {
      console.log(idx);
      const itemIdNum = parseInt(rec.item_id, 10);
      return {
        id: itemIdNum,
        name: `推奨すし(${rec.item_id})`,
        imageUrl: "https://example.com/recommended.png",
        isRecommended: true, // 推奨マーク
      };
    });

    // 例として「先頭から数えて5件後ろ」の位置にまとめて挿入
    // もしスクロール位置や現在見えている寿司のインデックスをトラッキングするなら
    // その位置 +5 などに挿入する方法もあり
    const insertIndex = 5;
    setAllSushiList((prev) => {
      const newList = [...prev];
      recommendedItems.forEach((item, i) => {
        newList.splice(insertIndex + i, 0, item);
      });
      return newList;
    });
  };

  return (
    <Box width="100vw" height="100vh" overflow="hidden">
      {/* 上半分: コンベア */}
      <Box height="50%" borderBottom="1px solid #ccc">
        {/* コンベアに流す寿司一覧として allSushiList を渡す */}
        <ConveyorSushi
          sushiList={allSushiList}
          onSushiClick={handleSushiClick}
        />
      </Box>

      {/* 下半分: 注文リスト */}
      <Box height="50%">
        {/* OrderedSushiList に評価コールバックを渡す */}
        <OrderedSushiList
          orderedSushi={orderedSushi}
          onRatingChange={handleRatingChange}
          ratings={ratings}
        />
      </Box>
    </Box>
  );
}

export default App;
