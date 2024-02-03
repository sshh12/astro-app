"use client";

import { Tab, TabGroup, TabList } from "@tremor/react";

export default function Tabs() {
  return (
    <TabGroup className="tabs-bottom-group">
      <TabList className="flex w-full tabs-bottom" variant="solid">
        <Tab className="flex-grow text-center">Sky Atlas</Tab>
        <Tab className="flex-grow text-center">Imaging</Tab>
        <Tab className="flex-grow text-center">Weather</Tab>
        <Tab className="flex-grow text-center">Gallery</Tab>
      </TabList>
    </TabGroup>
  );
}
