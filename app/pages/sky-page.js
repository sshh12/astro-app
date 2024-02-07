"use client";

import React, { useState, useEffect } from "react";
import { BadgeDelta, Card, Flex, Grid, Text, Title, Icon } from "@tremor/react";
import { MagnifyingGlassIcon, ListBulletIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAPI } from "../api";
import SkyChart from "../components/sky-chart";
import StickyHeader from "../components/sticky-header";

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function SkyPage() {
  const { page, setPage } = useNav();
  const { ready, user } = useAPI();

  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [chartData, setChartData] = useState(null);

  let favListObjects = [];
  if (ready) {
    favListObjects = user.lists.find(
      (list) => list.title === "Favorites"
    ).objects;
  }

  let lists = [];
  if (ready) {
    lists = user.lists.filter((list) => list.title !== "Favorites");
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Sky Atlas"
        subtitle={ready ? currentTime : "Loading..."}
        bigSubtitle={true}
        rightIcon={MagnifyingGlassIcon}
        rightIconOnClick={() => setPage("/sky/search")}
      />

      <div className="pb-6">
        {ready && (
          <SkyChart
            className="mt-6"
            times={user.orbits.time}
            timeStates={user.orbits.time_state}
            objects={favListObjects.map((obj) => ({
              alt: user.orbits.objects[obj.id].alt,
              name: obj.name,
              color: "red",
            }))}
          />
        )}
        {!ready && (
          <SkyChart className="mt-6" times={[]} timeStates={[]} objects={[]} />
        )}
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      <div className="mt-5 ml-2 mr-2">
        <Title>Favorites</Title>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        {favListObjects.map((obj) => (
          <Card
            className="cursor-pointer"
            key={obj.id}
            onClick={() => setPage("/sky/object")}
          >
            <Flex alignItems="start">
              <div className="truncate">
                <Text color="white">{obj.name}</Text>
              </div>
              <BadgeDelta deltaType={"moderateIncrease"}>{"10°"}</BadgeDelta>
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
        {lists.map((list) => (
          <Card key={list.id}>
            <Flex className="space-x-6">
              <Text color="white">{list.title}</Text>
              <Icon
                icon={ListBulletIcon}
                color="violet"
                variant="solid"
                size="lg"
              />
            </Flex>
          </Card>
        ))}
      </Grid>
    </div>
  );
}
