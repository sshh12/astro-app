"use client";

import { Tab, TabGroup, TabList } from "@tremor/react";
import { useNav } from "../nav";
import { useAnalytics } from "../api";

const TABS = [
  { label: "Sky", path: "/sky" },
  { label: "Location", path: "/location" },
  { label: "Profile", path: "/profile" },
];

export default function Tabs() {
  const { page, setPage } = useNav();
  const emitEvent = useAnalytics();
  return (
    <TabGroup className="tabs-bottom-group">
      <TabList
        className="flex w-full tabs-bottom justify-center"
        variant="solid"
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.path}
            className="flex-grow text-center"
            onClick={() => {
              emitEvent("tab_click");
              emitEvent(`tab_click_${tab.path.replace("/", "__")}`);
              setPage(tab.path);
            }}
            active={(page === tab.path).toString()}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
    </TabGroup>
  );
}
