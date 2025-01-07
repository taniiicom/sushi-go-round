"use client";

import React from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { chakra } from "@chakra-ui/react";

type Sushi = {
  id: number;
  name: string;
  imageUrl: string;
};

type OrderedSushiListProps = {
  orderedSushi: Sushi[];
};

// Chakra UIのBoxをmotion対応させたカスタムコンポーネント
const MotionBox = chakra(motion.div);

export default function OrderedSushiList({
  orderedSushi,
}: OrderedSushiListProps) {
  return (
    <Box width="100%" height="100%" overflowX="auto">
      {/* AnimatePresence でマウント/アンマウント時のアニメーションを制御 */}
      <AnimatePresence initial={false}>
        <Flex as={motion.div}>
          {orderedSushi.map((sushi, index) => (
            <MotionBox
              key={`${sushi.id}-${index}`}
              // 初期(マウント時)の状態
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              // アニメーション完了時の状態
              animate={{ y: 0, opacity: 1, scale: 1 }}
              // アンマウント時(今回は削除はしない想定なので省略可)
              exit={{ y: -50, opacity: 0, scale: 0.8 }}
              // “spring”でちょっと弾む動きに
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
              mr="16px"
              textAlign="center"
            >
              <Image
                src={sushi.imageUrl}
                alt={sushi.name}
                width="80px"
                mx="auto"
              />
              <Box>{sushi.name}</Box>
            </MotionBox>
          ))}
        </Flex>
      </AnimatePresence>
    </Box>
  );
}
