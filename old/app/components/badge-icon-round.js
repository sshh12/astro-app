"use client";

import { Badge } from "@tremor/react";

export default function BadgeIconRound({color, icon}) {
  return (
    <Badge
      style={{ paddingLeft: "10px", paddingRight: "0px", paddingTop: '4px', paddingBottom: '4px' }}
      icon={icon}
      color={color}
    ></Badge>
  );
}
