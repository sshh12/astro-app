"use client";

import React from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { Grid, Title } from "@tremor/react";
import { useNav } from "../nav";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import ObjectCard from "../components/object-card";
import { usePostWithCache } from "../api";

export default function SkyListPage() {
  const { pageParams, setPage } = useNav();

  const [listReady, list] = usePostWithCache(pageParams.id && "get_list", {
    id: pageParams.id,
  });

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title={pageParams.title}
        subtitle={""}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => setPage("/sky")}
        loading={!listReady}
      />

      <div className="pb-5 mt-6">
        {list && (
          <SkyChartPanel
            times={list.orbits.time}
            timeStates={list.orbits.time_state}
            timezone={list.orbits.timezone}
            objects={list.objects.map((obj) => ({
              alt: list.orbits.objects[obj.id].alt,
              az: list.orbits.objects[obj.id].az,
              name: obj.name,
              color: obj.color,
            }))}
          />
        )}
        {!list && <SkyChartPanel times={[]} timeStates={[]} objects={[]} />}
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      {list && (
        <>
          <div className="mt-5 ml-2 mr-2">
            <Title>Items</Title>
          </div>
          {list && (
            <Grid
              numItemsMd={2}
              numItemsLg={3}
              className="mt-2 gap-1 ml-2 mr-2"
            >
              {list.objects.map((obj) => (
                <ObjectCard key={obj.id} object={obj} orbits={list.orbits} />
              ))}
            </Grid>
          )}
        </>
      )}
    </div>
  );
}
