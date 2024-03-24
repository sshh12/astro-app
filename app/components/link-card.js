"use client";

import React from "react";
import { Card, Flex, Text } from "@tremor/react";
import BadgeIconRound from "../components/badge-icon-round";

export default function LinkCard({
  title,
  subtitle,
  icon,
  color,
  onClick,
  truncate = true,
}) {
  return (
    <Card onClick={onClick} className="cursor-pointer">
      <Flex alignItems="start">
        <div className="truncate">
          <Text color="white">{title}</Text>
        </div>
        <BadgeIconRound icon={icon} color={color} />
      </Flex>
      <Flex className={"mt-4 space-x-2 " + (truncate ? "truncate" : "")}>
        <div>
          <Text color="slate-400" className={truncate ? "truncate" : ""}>
            {subtitle}
          </Text>
        </div>
      </Flex>
    </Card>
  );
}
