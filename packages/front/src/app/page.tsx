"use client";

import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import ConveyorSushi from "@/components/org/ConveyorSushi";
import OrderedSushiList from "@/components/org/OrderedSushiList";

// サンプル用に寿司データを定義
// 画像URLは実際のものに置き換えてください
const sushiData = [
  { id: 1, name: "まぐろ", imageUrl: "https://example.com/maguro.png" },
  { id: 2, name: "サーモン", imageUrl: "https://example.com/salmon.png" },
  { id: 3, name: "えび", imageUrl: "https://example.com/ebi.png" },
  { id: 4, name: "はまち", imageUrl: "https://example.com/hamachi.png" },
  { id: 5, name: "いくら", imageUrl: "https://example.com/ikura.png" },
  // ... 無限リピート用に十分な量を増やしておく
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
