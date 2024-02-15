"use client";

import React from "react";
import { Card, Flex, Text, Icon } from "@tremor/react";
import { ListBulletIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";

export default function ListCard({ list }) {
  const { setPage } = useNav();

  return (
    <Card
      className="cursor-pointer"
      key={list.id}
      onClick={() => setPage("/sky/list", list)}
    >
      <Flex className="space-x-6">
        <Text color="white">{list.title}</Text>
        <Icon icon={ListBulletIcon} color="violet" variant="solid" size="lg" />
      </Flex>
    </Card>
  );
}
