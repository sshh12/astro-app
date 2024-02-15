import {
  TabGroup,
  TabPanels,
  TabPanel,
  TabList,
  Tab,
  Flex,
  Text,
} from "@tremor/react";
import SkyChart3D from "./sky-chart-3d";
import SkyChart from "./sky-chart";

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
        </TabPanels>
        <TabList
          className="flex w-full tabs-bottom justify-center"
          style={{ padding: 0, height: "3rem" }}
        >
          <Tab style={{ height: "3rem" }}>Altitude Chart</Tab>
          <Tab style={{ height: "3rem" }}>3D View</Tab>
        </TabList>
      </TabGroup>
    </div>
  );
}
