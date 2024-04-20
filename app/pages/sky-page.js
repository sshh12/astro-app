"use client";

import React from "react";
import { Grid, Title } from "@tremor/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAPI } from "../api";
import { useCallWithCache } from "../python";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import ListCard from "../components/list-card";
import ObjectsList from "../components/objects-list";
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

  const { result: favOrbits } = useCallWithCache(
    favListObjects && user && "get_orbit_calculations",
    "fav_orbits",
    user && {
      objects: favListObjects,
      timezone: user.timezone,
      lat: user.lat,
      lon: user.lon,
      elevation: user.elevation,
      resolution_mins: 10,
    }
  );

  let lists = [];
  if (user) {
    lists = user.lists.filter((list) => list.title !== "Favorites");
  }

  const timeFormatted = formatTime(ts, user?.timezone);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Sky"
        subtitle={timeFormatted}
        bigSubtitle={true}
        rightIcons={[
          { icon: MagnifyingGlassIcon, onClick: () => setPage("/sky/search") },
        ]}
        loading={!ready}
      />

      <div className="pb-5 mt-6">
        {favOrbits && (
          <SkyChartPanel
            times={favOrbits.time}
            timeStates={favOrbits.time_state}
            timezone={favOrbits.timezone}
            objects={favListObjects.map((obj) => ({
              alt: favOrbits.objects[obj.id].alt,
              az: favOrbits.objects[obj.id].az,
              name: obj.name,
              color: obj.color,
              object: obj,
            }))}
          />
        )}
        {!favOrbits && (
          <SkyChartPanel times={[]} timeStates={[]} objects={[]} />
        )}
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      {user && favOrbits && (
        <div className="ml-2 mr-2">
          <ObjectsList
            title="Favorites"
            objects={favListObjects}
            orbits={favOrbits}
          />

          <div className="mt-5">
            <Title>Lists</Title>
          </div>
          <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1">
            {lists.map((list) => (
              <ListCard list={list} key={list.id} />
            ))}
          </Grid>
        </div>
      )}
    </div>
  );
}
