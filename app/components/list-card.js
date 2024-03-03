"use client";

import React from "react";
import { Card, Flex, Text, Icon } from "@tremor/react";
import { ListBulletIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAnalytics } from "../api";

export default function ListCard({ list }) {
  const { setPage } = useNav();
  const emitEvent = useAnalytics();

  return (
    <Card
      className="cursor-pointer"
      key={list.id}
      onClick={() => {
        emitEvent("click_list_card");
        emitEvent(`click_list_card_${list.title}`);
        setPage("/sky/list", { id: list.id, title: list.title });
      }}
    >
      <Flex className="space-x-6">
        <Text color="white">{list.title}</Text>
        <Icon
          icon={ListBulletIcon}
          color={list.color.toLowerCase()}
          variant="solid"
          size="lg"
        />
      </Flex>
    </Card>
  );
}
