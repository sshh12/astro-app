"use client";
import React, { useState, useEffect } from "react";

import {
  BadgeDelta,
  Card,
  Flex,
  Grid,
  Metric,
  ProgressBar,
  Text,
  Title,
  Button,
  Subtitle,
  Divider,
  Icon,
} from "@tremor/react";
import { MagnifyingGlassIcon, ListBulletIcon } from "@heroicons/react/24/solid";

import LineChartExample from "../test-chart.js";

const skyData = [
  {
    title: "M81",
    delta: "14°",
    deltaType: "moderateIncrease",
  },
  {
    title: "M33",
    delta: "23°",
    deltaType: "increase",
  },
  {
    title: "M86",
    delta: "-10°",
    deltaType: "moderateDecrease",
  },
  {
    title: "M91",
    delta: "5°",
    deltaType: "unchanged",
  },
];

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function SkyPage() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <div
        className="sticky-top bg-slate-800 flex items-center justify-between w-full"
        style={{ padding: "8px 10px 8px 12px" }}
      >
        <div
          style={{
            opacity: Math.min(1.0, scrollPosition / 60),
            transition: "opacity 0.5s",
          }}
        >
          <Title>Sky Atlas</Title>
          <Subtitle>{currentTime}</Subtitle>
        </div>
        <Button color="slate-800" icon={MagnifyingGlassIcon}></Button>
      </div>

      <div className="bg-slate-800" style={{ padding: "0px 10px 0px 12px" }}>
        <Title>Sky Atlas</Title>
        <Metric>{currentTime}</Metric>
      </div>

      <div className="pb-6">
        <LineChartExample />
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      <div className="mt-5 ml-2 mr-2">
        <Title>Favorites</Title>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        {skyData.concat(skyData).map((item) => (
          <Card key={item.title}>
            <Flex alignItems="start">
              <div className="truncate">
                <Text color="white">{item.title}</Text>
              </div>
              <BadgeDelta deltaType={item.deltaType}>{item.delta}</BadgeDelta>
            </Flex>
            <Flex className="mt-4 space-x-2">
              <div>
                <Text className="truncate">RA 07.34.54</Text>
                <Text className="truncate">DEC 12.54.45</Text>
                <Text className="truncate">T+20m</Text>
              </div>
            </Flex>
          </Card>
        ))}
      </Grid>

      <div className="mt-5 ml-2 mr-2">
        <Title>Lists</Title>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        <Card>
          <Flex className="space-x-6">
            <Text color="white">Nebulas</Text>
            <Icon
              icon={ListBulletIcon}
              color="violet"
              variant="solid"
              size="lg"
            />
          </Flex>
        </Card>
        <Card>
          <Flex className="space-x-6">
            <Text color="white">Galaxies</Text>
            <Icon
              icon={ListBulletIcon}
              color="green"
              variant="solid"
              size="lg"
            />
          </Flex>
        </Card>
      </Grid>
    </div>
  );
}
