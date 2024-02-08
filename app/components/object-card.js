"use client";

import React from "react";
import { BadgeDelta, Badge, Card, Flex, Text } from "@tremor/react";
import { useNav } from "../nav";
import { useTimestamp, getInterpolatedValue } from "../utils";

function altToDelta(alt) {
  if (alt < -20) {
    return "decrease";
  } else if (alt < 0) {
    return "moderateDecrease";
  } else if (alt < 20) {
    return "unchanged";
  } else if (alt < 60) {
    return "moderateIncrease";
  } else {
    return "increase";
  }
}

export default function ObjectCard({ object, orbits }) {
  const { setPage } = useNav();
  const { ts } = useTimestamp();
  const orbitAlt = orbits.objects[object.id].alt;
  const alt = getInterpolatedValue(orbits.time, ts, orbitAlt);
  const day = ts < orbits.time[0] || ts > orbits.time[orbits.time.length - 1];
  return (
    <Card
      className="cursor-pointer"
      key={object.id}
      onClick={() => setPage("/sky/object", object)}
    >
      <Flex alignItems="start">
        <div className="truncate">
          <Text color="white">{object.name}</Text>
        </div>
        {!day && (
          <BadgeDelta deltaType={altToDelta(alt)}>
            {Math.round(alt)}°
          </BadgeDelta>
        )}
        {day && <Badge color="yellow">Daytime</Badge>}
      </Flex>
    </Card>
  );
}
