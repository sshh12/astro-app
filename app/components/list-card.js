"use client";

import React from "react";
import { Card, Flex, Text, Icon } from "@tremor/react";
import { ListBulletIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAnalytics, useAPI } from "../api";

export default function ListCard({ list }) {
  const { objectViewMode } = useAPI();
  const { setPage } = useNav();
  const emitEvent = useAnalytics();

  const compact = objectViewMode.sizeMode !== "full";

  return (
    <Card
      className={!compact ? "cursor-pointer p-4" : "cursor-pointer p-2"}
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
