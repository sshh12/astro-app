"use client";

import { Tab, TabGroup, TabList } from "@tremor/react";
import { useNav } from "../nav";

const TABS = [
  { label: "Sky Atlas", path: "/sky" },
  { label: "Profile", path: "/profile" },
];

export default function Tabs() {
  const { page, setPage } = useNav();
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
            onClick={() => setPage(tab.path)}
            active={page === tab.path}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
    </TabGroup>
  );
}
