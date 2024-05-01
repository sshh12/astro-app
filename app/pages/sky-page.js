"use client";

import React, { useEffect, useMemo } from "react";
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
  const { ready, user, objectStore, listStore, location } = useAPI();

  useEffect(() => {
    if (user && objectStore) {
      const objects = user.lists.reduce((acc, list) => {
        return acc.concat(list.objects);
      }, []);
      Promise.all(objects.map((obj) => objectStore.setItem(obj.id, obj)));
    }
  }, [user, objectStore]);

  useEffect(() => {
    if (user && listStore) {
      Promise.all(user.lists.map((list) => listStore.setItem(list.id, list)));
    }
  }, [user, listStore]);

  const { ts } = useTimestamp();
  const timeFormatted = formatTime(ts, location?.timezone);

  const favListObjects = useMemo(() => {
    if (user) {
      return user.lists.find((list) => list.title === "Favorites").objects;
    }
    return [];
  }, [user]);

  const lists = useMemo(() => {
    if (user) {
      return user.lists.filter((list) => list.title !== "Favorites");
    }
    return [];
  }, [user]);

  const { result: favOrbits } = useCallWithCache(
    "get_orbit_calculations",
    favListObjects && location && `${location.id}_favorites_orbits`,
    favListObjects &&
      location && {
        objects: favListObjects,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      }
  );

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

      {user && (
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
