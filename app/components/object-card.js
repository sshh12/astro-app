"use client";

import React from "react";
import { BadgeDelta, Badge, Card, Flex, Text } from "@tremor/react";
import { useNav } from "../nav";
import { useAPI } from "../api";
import { useTimestamp, getInterpolatedValue, getMaxWhile } from "../utils";

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
  const { objectBadgeMode, setObjectBadgeMode } = useAPI();
  const { ts } = useTimestamp();

  const orbitAlt = orbits.objects[object.id].alt;
  const alt = getInterpolatedValue(orbits.time, ts, orbitAlt);
  const isDay = ts < orbits.time[0] || ts > orbits.time[orbits.time.length - 1];
  const maxAlt = getMaxWhile(
    orbitAlt,
    (i) => orbits.time_state[i] > 0 && orbits.time_state[i] < 7
  );

  const onBadgeClick = (e) => {
    e.stopPropagation();
    setObjectBadgeMode((objectBadgeMode + 1) % 2);
  };

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
        {objectBadgeMode == 0 && !isDay && (
          <BadgeDelta
            deltaType={altToDelta(alt)}
            onClick={(e) => onBadgeClick(e)}
          >
            {Math.round(alt)}°
          </BadgeDelta>
        )}
        {objectBadgeMode == 0 && isDay && (
          <Badge color="yellow" onClick={(e) => onBadgeClick(e)}>
            Daytime
          </Badge>
        )}
        {objectBadgeMode == 1 && (
          <BadgeDelta
            deltaType={altToDelta(maxAlt)}
            onClick={(e) => onBadgeClick(e)}
          >
            Max {Math.round(maxAlt)}°
          </BadgeDelta>
        )}
      </Flex>
    </Card>
  );
}
