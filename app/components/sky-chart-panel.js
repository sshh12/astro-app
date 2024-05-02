import { TabGroup, TabPanels, TabPanel, TabList, Tab } from "@tremor/react";
import SkyChart from "./sky-chart";
import SkyChartGallery from "./sky-chart-gallery";
import { useNav } from "../nav";

export default function SkyChartPanel({
  times,
  timeStates,
  timezone,
  objects,
}) {
  const { setPage } = useNav();
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
            <SkyChartGallery objects={objects} />
          </TabPanel>
          <TabPanel></TabPanel>
        </TabPanels>
        <TabList
          className="flex w-full tabs-bottom justify-center"
          style={{ padding: 0, height: "3rem" }}
        >
          <Tab style={{ height: "3rem" }}>Altitude</Tab>
          <Tab
            style={{
              height: "3rem",
              display: objects.length > 1 ? "block" : "none",
            }}
          >
            Gallery
          </Tab>
          <Tab
            style={{ height: "3rem" }}
            disabled={objects.length === 0}
            onClick={() =>
              setPage("/sky/orbits", {
                orbitObjectIds: objects.map((o) => o.object.id),
              })
            }
          >
            Orbits
          </Tab>
        </TabList>
      </TabGroup>
    </div>
  );
}
