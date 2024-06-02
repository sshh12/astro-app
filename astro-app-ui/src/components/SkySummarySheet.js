import Sheet from "@mui/joy/Sheet";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Typography from "@mui/joy/Typography";
import SkyAltChart from "../charts/SkyAltitudesChart";

function SkySummaries() {
  return (
    <Tabs>
      <TabList
        sx={{
          justifyContent: { xs: "center", sm: "start" },
          display: "flex",
          overflow: "hidden",
        }}
      >
        <Tab sx={{ flexGrow: { xs: 1, sm: 0 } }}>
          <Typography level="title-sm">Altitudes</Typography>
        </Tab>
        <Tab sx={{ flexGrow: { xs: 1, sm: 0 } }}>
          <Typography level="title-sm">Orbits</Typography>
        </Tab>
      </TabList>
      <TabPanel value={0} sx={{ p: 0 }}>
        <SkyAltChart />
      </TabPanel>
      <TabPanel value={1} sx={{ p: 0 }}>
        B
      </TabPanel>
    </Tabs>
  );
}

export default function SkySummarySheet() {
  return (
    <Sheet
      variant="outlined"
      sx={{
        display: "inherit",
        borderRadius: "sm",
        overflow: "hidden",
        backgroundColor: "background.surface",
        gridColumn: "1/-1",
        height: "20rem",
      }}
    >
      <SkySummaries />
    </Sheet>
  );
}
