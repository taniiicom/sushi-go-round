"use client";

import React from "react";
import { Box, Flex, Image, HStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { chakra } from "@chakra-ui/react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

type Sushi = {
  id: number;
  name: string;
  imageUrl: string;
};

type OrderedSushiListProps = {
  orderedSushi: Sushi[];
  onRatingChange: (sushiId: number, rating: number) => void;
  ratings: Record<number, number>; // すしID→評価
};

// [uiux][design][animation] OrderedSushiList > 注文時にホップアニメーションを追加 ^^
// Chakra UIのBoxをmotion対応させたカスタムコンポーネント
const MotionBox = chakra(motion.div);

export default function OrderedSushiList({
  orderedSushi,
  onRatingChange,
  ratings,
}: OrderedSushiListProps) {
  return (
    <Box width="100%" height="100%" overflowX="auto">
      {/* AnimatePresence でマウント/アンマウント時のアニメーションを制御 */}
      <AnimatePresence initial={false}>
        <Flex as={motion.div}>
          {orderedSushi.map((sushi, index) => {
            // このすしの評価値(未評価なら0)
            const rating = ratings[sushi.id] ?? 0;

            return (
              <MotionBox
                key={`${sushi.id}-${index}`}
                // 初期(マウント時)の状態
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                // アニメーション完了時の状態
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  // “spring”でちょっと弾む動きに
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  },
                }}
                // アンマウント時(今回は削除はしない想定なので省略可)
                exit={{ y: -50, opacity: 0, scale: 0.8 }}
                mr="16px"
                textAlign="center"
              >
                {/* すし画像 */}
                <Image
                  src={sushi.imageUrl}
                  alt={sushi.name}
                  width="200px"
                  mx="auto"
                />
                <Box>{sushi.name}</Box>

                {/* 5つ星評価 */}
                <HStack justify="center" spacing={1} mt={2}>
                  {/* 星の数だけ配列を作り, mapでアイコンを出力 */}
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isActive = starValue <= rating;
                    return (
                      <Box
                        key={starValue}
                        cursor="pointer"
                        onClick={() => onRatingChange(sushi.id, starValue)}
                      >
                        {isActive ? (
                          <AiFillStar color="gold" size={24} />
                        ) : (
                          <AiOutlineStar color="gold" size={24} />
                        )}
                      </Box>
                    );
                  })}
                </HStack>
              </MotionBox>
            );
          })}
        </Flex>
      </AnimatePresence>
    </Box>
  );
}
