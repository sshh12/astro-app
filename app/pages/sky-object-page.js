"use client";

import React from "react";
import { PlusIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import SkyChart from "../components/sky-chart";
import StickyHeader from "../components/sticky-header";

const chartdata = [
  {
    year: 1970,
    "Export Growth Rate": 2.04,
    "Import Growth Rate": 1.53,
  },
  {
    year: 1971,
    "Export Growth Rate": 1.96,
    "Import Growth Rate": 1.58,
  },
  {
    year: 1972,
    "Export Growth Rate": 1.96,
    "Import Growth Rate": 1.61,
  },
  {
    year: 1973,
    "Export Growth Rate": 1.93,
    "Import Growth Rate": 1.61,
  },
  {
    year: 1974,
    "Export Growth Rate": 1.88,
    "Import Growth Rate": 1.67,
  },
  {
    year: 1975,
    "Export Growth Rate": 1.88,
    "Import Growth Rate": 1.67,
  },
];

const valueFormatter = (number) =>
  `$ ${new Intl.NumberFormat("us").format(number).toString()}`;

export default function SkyObjectPage() {
  const { setPage } = useNav();

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="M81"
        subtitle={"Bodes Galaxy"}
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
