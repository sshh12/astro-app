"use client";

import { Tab, TabGroup, TabList } from "@tremor/react";
import { useLocation, Link } from "react-router-dom";

export default function Tabs() {
  const location = useLocation();
  let idx = 0;
  if (location.pathname.startsWith("/test")) {
    idx = 1;
  }
  return (
    <TabGroup className="tabs-bottom-group" index={idx}>
      <TabList className="flex w-full tabs-bottom" variant="solid">
        <Tab className="flex-grow text-center">
          <Link to={"/"}>Sky Atlas</Link>
        </Tab>

        <Tab className="flex-grow text-center">
          <Link to={"/test"}>Imaging</Link>
        </Tab>

        {/* <Tab className="flex-grow text-center">Weather</Tab>
        <Tab className="flex-grow text-center">Gallery</Tab> */}
      </TabList>
    </TabGroup>
  );
}
