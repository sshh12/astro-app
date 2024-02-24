"use client";

import React from "react";
import { BadgeDelta, Badge, Card, Flex, Text } from "@tremor/react";
import { useNav } from "../nav";
import { useAPI, useAnalytics } from "../api";
import {
  useTimestamp,
  getInterpolatedValue,
  getMaxWhile,
  formatTime,
} from "../utils";

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
  const { objectBadgeMode, setObjectBadgeMode, user } = useAPI();
  const { ts } = useTimestamp();
  const emitEvent = useAnalytics();

  const orbitAlt = orbits.objects[object.id].alt;
  const orbitAz = orbits.objects[object.id].az;
  const alt = getInterpolatedValue(orbits.time, ts, orbitAlt);
  const az = getInterpolatedValue(orbits.time, ts, orbitAz);
  const isDay = ts < orbits.time[0] || ts > orbits.time[orbits.time.length - 1];
  const [maxAlt, maxAltIdx] = getMaxWhile(
    orbitAlt,
    (i) => orbits.time_state[i] > 0 && orbits.time_state[i] < 7
  );
  const maxAltTime = orbits.time[maxAltIdx];

  const onBadgeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setObjectBadgeMode((objectBadgeMode + 1) % 4);
  };

  return (
    <Card
      className="cursor-pointer"
      key={object.id}
      onClick={() => {
        emitEvent("click_object_card");
        emitEvent(`click_object_card_${object.name}`);
        setPage("/sky/object", object);
      }}
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
        {objectBadgeMode == 1 && !isDay && (
          <BadgeDelta
            deltaType={altToDelta(alt)}
            onClick={(e) => onBadgeClick(e)}
          >
            ALT {Math.round(alt)}° AZ {Math.round(az)}°
          </BadgeDelta>
        )}
        {objectBadgeMode == 1 && isDay && (
          <Badge color="yellow" onClick={(e) => onBadgeClick(e)}>
            Daytime
          </Badge>
        )}
        {objectBadgeMode == 2 && (
          <BadgeDelta
            deltaType={altToDelta(maxAlt)}
            onClick={(e) => onBadgeClick(e)}
          >
            Max {Math.round(maxAlt)}°
          </BadgeDelta>
        )}
        {objectBadgeMode == 3 && (
          <BadgeDelta
            deltaType={altToDelta(maxAlt)}
            onClick={(e) => onBadgeClick(e)}
          >
            Max {Math.round(maxAlt)}° at{" "}
            {formatTime(maxAltTime, user?.timezone)}
          </BadgeDelta>
        )}
      </Flex>
    </Card>
  );
}
