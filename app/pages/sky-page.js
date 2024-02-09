"use client";

import React, { useState, useEffect } from "react";
import { Grid, Title } from "@tremor/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAPI } from "../api";
import SkyChart from "../components/sky-chart";
import StickyHeader from "../components/sticky-header";
import ObjectCard from "../components/object-card";
import ListCard from "../components/list-card";

function getTime(tz) {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: tz,
  });
}

export default function SkyPage() {
  const { setPage } = useNav();
  const { ready, user } = useAPI();

  const [currentTime, setCurrentTime] = useState();

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
    let intervalId;
    if (ready) {
      intervalId = setInterval(() => {
        setCurrentTime(getTime(user.timezone));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [ready, user]);

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
            timezone={user.orbits.timezone}
            objects={favListObjects.map((obj) => ({
              alt: user.orbits.objects[obj.id].alt,
              name: obj.name,
              color: ["red", "green", "blue", "yellow", "purple"][obj.id % 5],
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
          <ObjectCard key={obj.id} object={obj} orbits={user.orbits} />
        ))}
      </Grid>

      <div className="mt-5 ml-2 mr-2">
        <Title>Lists</Title>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        {lists.map((list) => (
          <ListCard list={list} key={list.id} />
        ))}
      </Grid>
    </div>
  );
}
