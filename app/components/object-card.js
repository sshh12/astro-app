"use client";

import React, { useState } from "react";
import { BadgeDelta, Badge, Card, Flex, Text } from "@tremor/react";
import { useNav } from "../nav";
import { useAPI, useAnalytics } from "../api";
import {
  useTimestamp,
  getInterpolatedValue,
  getMaxWhile,
  formatTime,
  objectAKA,
} from "../utils";
import ObjectViewDialog from "./object-view-dialog";

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

const BADGE_MODES = [
  {
    id: "max-alt",
    label: "Show Tonight's Max Altitude",
    render: ({ maxAlt, onBadgeClick }) => (
      <BadgeDelta
        deltaType={altToDelta(maxAlt)}
        onClick={(e) => onBadgeClick(e)}
      >
        Max {Math.round(maxAlt)}°
      </BadgeDelta>
    ),
  },
  {
    id: "max-alt-time",
    label: "Show Tonight's Max Altitude & Time",
    render: ({ maxAlt, maxAltTime, onBadgeClick, user }) => (
      <BadgeDelta
        deltaType={altToDelta(maxAlt)}
        onClick={(e) => onBadgeClick(e)}
      >
        Max {Math.round(maxAlt)}° at{" "}
        {formatTime(maxAltTime, user?.timezone, true)}
      </BadgeDelta>
    ),
  },
  {
    id: "live-alt",
    label: "Show Live Altitude",
    render: ({ onBadgeClick, isDay, alt }) =>
      !isDay ? (
        <BadgeDelta
          deltaType={altToDelta(alt)}
          onClick={(e) => onBadgeClick(e)}
        >
          {Math.round(alt)}°
        </BadgeDelta>
      ) : (
        <Badge color="yellow" onClick={(e) => onBadgeClick(e)}>
          Daytime
        </Badge>
      ),
  },
  {
    id: "live-alt-az",
    label: "Show Live Altitude & Azimuth",
    render: ({ onBadgeClick, isDay, alt, az }) =>
      !isDay ? (
        <BadgeDelta
          deltaType={altToDelta(alt)}
          onClick={(e) => onBadgeClick(e)}
        >
          ALT {Math.round(alt)}° AZ {Math.round(az)}°
        </BadgeDelta>
      ) : (
        <Badge color="yellow" onClick={(e) => onBadgeClick(e)}>
          Daytime
        </Badge>
      ),
  },
];

const IMAGE_MODES = [
  {
    id: "wiki",
    label: "Show Wiki Image",
    render: ({ object }) => (
      <img style={{ width: "100%" }} src={object.imgURL} alt="Astro image" />
    ),
  },
  {
    id: "dss2",
    label: "Show CDS/P/DSS2 Sky Survey",
    render: ({ object }) =>
      !!object.ra ? (
        <img
          style={{ width: "100%" }}
          src={`https://alasky.cds.unistra.fr/hips-image-services/hips2fits?hips=CDS%2FP%2FDSS2%2Fcolor&width=1200&height=900&fov=1.0&projection=TAN&coordsys=icrs&rotation_angle=0.0&ra=${
            object.ra * 15
          }&dec=${object.dec}&format=jpg`}
          alt="Astro image"
        />
      ) : (
        <img style={{ width: "100%" }} src={object.imgURL} alt="Astro image" />
      ),
  },
];

export default function ObjectCard({ object, orbits }) {
  const { setPage } = useNav();
  const { objectViewMode, setObjectViewMode, user } = useAPI();
  const { ts } = useTimestamp();
  const emitEvent = useAnalytics();
  const [openViewEditor, setOpenViewEditor] = useState(false);

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
    setOpenViewEditor(true);
  };

  const badgeToRender = objectViewMode.badgeMode;
  const BadgeElement = BADGE_MODES.find((b) => b.id === badgeToRender).render;

  const imageToRender = objectViewMode.imageMode;
  const ImageElement = IMAGE_MODES.find((b) => b.id === imageToRender).render;

  return (
    <>
      <ObjectViewDialog
        badgeModes={BADGE_MODES}
        imageModes={IMAGE_MODES}
        objectViewMode={objectViewMode}
        setObjectViewMode={setObjectViewMode}
        open={openViewEditor}
        setOpen={setOpenViewEditor}
      />
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
          <BadgeElement
            maxAlt={maxAlt}
            maxAltTime={maxAltTime}
            onBadgeClick={onBadgeClick}
            isDay={isDay}
            user={user}
            alt={alt}
            az={az}
          />
        </Flex>
        <Flex className="mt-2" style={{ minHeight: "2.5rem" }}>
          <Text>{objectAKA(object).join(", ")}&nbsp;</Text>
        </Flex>
        <Flex className="border-solid border-2 border-gray-700 mt-2">
          <ImageElement object={object} />
        </Flex>
      </Card>
    </>
  );
}
