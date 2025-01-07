"use client";

import React from "react";
import { Box, Flex, Image } from "@chakra-ui/react";

type Sushi = {
  id: number;
  name: string;
  imageUrl: string;
};

type OrderedSushiListProps = {
  orderedSushi: Sushi[];
};

export default function OrderedSushiList({
  orderedSushi,
}: OrderedSushiListProps) {
  return (
    <Box width="100%" height="100%" overflowX="auto">
      <Flex>
        {orderedSushi.map((sushi, index) => (
          <Box key={`${sushi.id}-${index}`} mr="16px" textAlign="center">
            <Image
              src={sushi.imageUrl}
              alt={sushi.name}
              width="80px"
              mx="auto"
            />
            <Box>{sushi.name}</Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}
