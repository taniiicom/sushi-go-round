"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Button, HStack, Image } from "@chakra-ui/react";

type SushiData = {
  id: number;
  name: string;
  imageUrl: string;
  isRecommended?: boolean; // 追加
};

type ConveyorSushiProps = {
  sushiList: SushiData[];
  onSushiClick: (sushi: SushiData) => void;
};

export default function ConveyorSushi({
  sushiList,
  onSushiClick,
}: ConveyorSushiProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // 自動スクロールの速度(px単位).  数値を変えて調整
  const scrollSpeed = 1;

  // 自動スクロールの間隔(ms単位).  1000/60 ≈ 16ms だと約60fps
  const intervalMs = 16;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrame: number;
    let lastTimestamp = 0;

    const step = (timestamp: number) => {
      // 前回からの経過時間が intervalMs 以上ならスクロールする
      if (timestamp - lastTimestamp > intervalMs) {
        if (isAutoScrolling) {
          container.scrollLeft += scrollSpeed;
          // 末端までスクロールしたら先頭に戻す
          if (
            container.scrollLeft >=
            container.scrollWidth - container.clientWidth
          ) {
            container.scrollLeft = 0;
          }
        }
        lastTimestamp = timestamp;
      }

      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isAutoScrolling, scrollSpeed, intervalMs]);

  // 進むボタン
  const handleForward = () => {
    setIsAutoScrolling(false);
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollLeft += 100; // 進む幅
  };

  // 戻るボタン
  const handleBackward = () => {
    setIsAutoScrolling(false);
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollLeft -= 100; // 戻る幅
    if (container.scrollLeft < 0) {
      container.scrollLeft = container.scrollWidth;
    }
  };

  // 再自動スクロール
  const handleResume = () => {
    setIsAutoScrolling(true);
  };

  return (
    <Box position="relative" height="100%" width="100%">
      {/* 左右ボタン */}
      <HStack
        spacing={4}
        position="absolute"
        top="8px"
        left="50%"
        transform="translateX(-50%)"
        zIndex={10}
      >
        <Button onClick={handleBackward}>←</Button>
        <Button onClick={handleForward}>→</Button>
        <Button onClick={handleResume}>{"▶"}</Button>
      </HStack>

      {/* 横スクロールコンテナ */}
      <Box
        ref={scrollContainerRef}
        width="100%"
        height="100%"
        whiteSpace="nowrap"
        overflowX="scroll"
        overflowY="hidden"
        scrollBehavior="smooth" // ボタン押下時はスムーススクロール
        alignContent="center"
      >
        {/* 無限ループ表示用に, ある程度多めに寿司を並べる */}
        {sushiList
          .concat(sushiList)
          .concat(sushiList)
          .map((sushi, idx) => {
            // isRecommended なら, 背景色を薄い黄色に
            const bgColor = sushi.isRecommended ? "yellow.100" : "transparent";
            return (
              <Box
                key={`${sushi.id}-${idx}`}
                display="inline-block"
                width="250px"
                textAlign="center"
                cursor="pointer"
                bg={bgColor}
                p={2}
                onClick={() => onSushiClick(sushi)}
              >
                <Image
                  src={sushi.imageUrl}
                  alt={sushi.name}
                  width="200px"
                  mx="auto"
                />
                <Box fontSize={22}>{sushi.name}</Box>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
}
