"use client";

import { Tab, TabGroup, TabList } from "@tremor/react";
import { useNav } from "../nav";

export default function Tabs() {
  const { page, setPage } = useNav();
  return (
    <TabGroup className="tabs-bottom-group">
      <TabList className="flex w-full tabs-bottom" variant="solid">
        <Tab className="flex-grow text-center" onClick={() => setPage("/sky")}>
          Sky Atlas
        </Tab>
        <Tab className="flex-grow text-center" onClick={() => setPage("/test")}>
          Imaging
        </Tab>
      </TabList>
    </TabGroup>
  );
}
