"use client";

import React from "react";
import { Grid, Title } from "@tremor/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAPI } from "../api";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import ObjectCard from "../components/object-card";
import ListCard from "../components/list-card";
import IntroDialog from "../components/intro-dialog";
import { useTimestamp, formatTime } from "../utils";

export default function SkyPage() {
  const { setPage } = useNav();
  const { ready, user } = useAPI();

  const { ts } = useTimestamp();

  let favListObjects = [];
  if (user) {
    favListObjects = user.lists.find(
      (list) => list.title === "Favorites"
    ).objects;
  }

  let lists = [];
  if (user) {
    lists = user.lists.filter((list) => list.title !== "Favorites");
  }

  const timeFormatted = formatTime(ts, user?.timezone);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Sky Atlas"
        subtitle={timeFormatted}
        bigSubtitle={true}
        rightIcon={MagnifyingGlassIcon}
        rightIconOnClick={() => setPage("/sky/search")}
        loading={!ready}
      />

      <IntroDialog />

      <div className="pb-5 mt-6">
        {user && (
          <SkyChartPanel
            times={user.orbits.time}
            timeStates={user.orbits.time_state}
            timezone={user.orbits.timezone}
            objects={favListObjects.map((obj) => ({
              alt: user.orbits.objects[obj.id].alt,
              az: user.orbits.objects[obj.id].az,
              name: obj.name,
              color: obj.color,
            }))}
          />
        )}
        {!user && <SkyChartPanel times={[]} timeStates={[]} objects={[]} />}
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      {user && (
        <>
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
        </>
      )}
    </div>
  );
}
