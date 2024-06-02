import Sheet from "@mui/joy/Sheet";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Typography from "@mui/joy/Typography";

function SkyViews() {
  return (
    <Tabs>
      <TabList>
        <Tab sx={{ flexGrow: 1 }}>
          <Typography level="title-sm">Altitudes</Typography>
        </Tab>
        <Tab sx={{ flexGrow: 1 }}>
          <Typography level="title-sm">Orbits</Typography>
        </Tab>
      </TabList>
      <TabPanel value={0} sx={{ p: 0 }}>
        A
      </TabPanel>
      <TabPanel value={1} sx={{ p: 0 }}>
        B
      </TabPanel>
    </Tabs>
  );
}

export default function SkyViewSheet() {
  return (
    <>
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "sm",
          gridColumn: "1/-1",
          display: { xs: "none", sm: "inherit", md: "flex", lg: "flex" },
        }}
      >
        <SkyViews />
      </Sheet>
      <Sheet
        variant="outlined"
        sx={{
          display: { xs: "inherit", sm: "none" },
          borderRadius: "sm",
          overflow: "auto",
          backgroundColor: "background.surface",
        }}
      >
        <SkyViews />
      </Sheet>
    </>
  );
}
