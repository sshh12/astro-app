"use client";

import React from "react";
import { PlusIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import SkyChart from "../components/sky-chart";
import StickyHeader from "../components/sticky-header";

export default function SkyObjectPage() {
  const { pageParams, setPage } = useNav();

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title={pageParams.name}
        subtitle={pageParams.id}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => setPage("/sky")}
        rightIcon={PlusIcon}
        rightIconOnClick={() => void 0}
      />

      <div className="pb-6">
        {/* <SkyChart
          className="mt-6"
          data={chartdata}
          index="year"
          categories={["Export Growth Rate", "Import Growth Rate"]}
          colors={["emerald", "gray"]}
          valueFormatter={valueFormatter}
          yAxisWidth={40}
          showGradient={false}
          showYAxis={false}
        /> */}
      </div>
    </div>
  );
}
