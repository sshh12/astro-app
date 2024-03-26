import { TabGroup, TabPanels, TabPanel, TabList, Tab } from "@tremor/react";
import SkyChart3D from "./sky-chart-3d";
import SkyChart from "./sky-chart";
import SkyChartGallery from "./sky-chart-gallery";

export default function SkyChartPanel({
  times,
  timeStates,
  timezone,
  objects,
}) {
  return (
    <div>
      <TabGroup>
        <TabPanels>
          <TabPanel>
            <SkyChart
              times={times}
              timeStates={timeStates}
              timezone={timezone}
              objects={objects}
            />
          </TabPanel>
          <TabPanel>
            <SkyChart3D
              times={times}
              timeStates={timeStates}
              timezone={timezone}
              objects={objects}
            />
          </TabPanel>
          <TabPanel>
            <SkyChartGallery objects={objects} />
          </TabPanel>
        </TabPanels>
        <TabList
          className="flex w-full tabs-bottom justify-center"
          style={{ padding: 0, height: "3rem" }}
        >
          <Tab style={{ height: "3rem" }}>Altitude</Tab>
          <Tab style={{ height: "3rem" }}>Orbits</Tab>
          <Tab
            style={{
              height: "3rem",
              display: objects.length > 1 ? "block" : "none",
            }}
          >
            Gallery
          </Tab>
        </TabList>
      </TabGroup>
    </div>
  );
}
