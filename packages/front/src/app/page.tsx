"use client";

import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import ConveyorSushi from "@/components/org/ConveyorSushi";
import OrderedSushiList from "@/components/org/OrderedSushiList";

// サンプル用に寿司データを定義
// 画像URLは実際のものに置き換えてください
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
];

function App() {
  const [orderedSushi, setOrderedSushi] = useState<
    { id: number; name: string; imageUrl: string }[]
  >([]);

  // 寿司がクリックされたら, 下半分に追加する
  const handleSushiClick = (sushi: {
    id: number;
    name: string;
    imageUrl: string;
  }) => {
    setOrderedSushi((prev) => [...prev, sushi]);
  };

  return (
    <Box width="100vw" height="100vh" overflow="hidden">
      {/* 上半分: コンベア */}
      <Box height="50%" borderBottom="1px solid #ccc">
        <ConveyorSushi sushiList={sushiData} onSushiClick={handleSushiClick} />
      </Box>

      {/* 下半分: 注文リスト */}
      <Box height="50%">
        <OrderedSushiList orderedSushi={orderedSushi} />
      </Box>
    </Box>
  );
}

export default App;
