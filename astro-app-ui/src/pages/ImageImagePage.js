import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CssBaseline from "@mui/joy/CssBaseline";
import Divider from "@mui/joy/Divider";
import Sheet from "@mui/joy/Sheet";
import Slider from "@mui/joy/Slider";
import Stack from "@mui/joy/Stack";
import { CssVarsProvider } from "@mui/joy/styles";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import Typography from "@mui/joy/Typography";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { SubPageHeader } from "../components/Headers";
import Layout from "../components/Layout";
import OverlayImage from "../components/OverlayImage";
import { SideBarNav } from "../components/Sidebars";
import { useBackend, useObjects } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { theme } from "../theme/theme";
import { useCurrentObservingWindow } from "../utils/date";
import { objectsToKey } from "../utils/object";

function ImageLocationCard({ image }) {
  const [zoom, setZoom] = useState(0);
  return (
    <Card sx={{ p: 0, maxWidth: "400px" }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">Location</Typography>
        <Typography level="body-sm">
          Where you can find this image in the sky.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ px: 6, pb: 2 }}>
        <Slider
          aria-label="Zoom"
          value={zoom}
          getAriaValueText={(v) => v}
          valueLabelDisplay="auto"
          onChange={(_, v) => setZoom(v)}
          marks={[
            {
              value: 0,
              label: "Full Sky",
            },
            {
              value: 1,
              label: "",
            },
            {
              value: 2,
              label: "Zoomed",
            },
          ]}
          min={0}
          max={2}
        />
      </Box>
      <Box>
        <AspectRatio ratio={1}>
          <img
            src={`https://nova.astrometry.net/sky_plot/zoom${zoom}/${image.astrometryJobCalibrationsId}/`}
            alt={image.id}
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        </AspectRatio>
      </Box>
    </Card>
  );
}

function ImageSheet({ image, objects, orbits }) {
  return (
    <Sheet variant="outlined">
      <Tabs>
        <TabList
          sx={{
            justifyContent: { xs: "center", sm: "start" },
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Tab sx={{ flexGrow: { xs: 1, sm: 0 } }}>
            <Typography level="title-sm">Annotated Image</Typography>
          </Tab>
          <Tab sx={{ flexGrow: { xs: 1, sm: 0 } }}>
            <Typography level="title-sm">Full Image</Typography>
          </Tab>
        </TabList>
        <TabPanel value={0} sx={{ p: 0 }}>
          <Box sx={{ width: "100%", height: "100%" }}>
            <OverlayImage image={image} objects={objects} orbits={orbits} />
          </Box>
        </TabPanel>
        <TabPanel value={1} sx={{ p: 0 }}>
          <Box sx={{ width: "100%", height: "100%" }}>
            <img
              src={image?.mainImageUrl}
              alt={image?.title}
              style={{ width: "100%" }}
            />
          </Box>
        </TabPanel>
      </Tabs>
    </Sheet>
  );
}

export default function ImageImagePage() {
  const { id: imageId } = useParams();
  const { location, user } = useBackend();
  const image = user?.images.find((img) => img.id === imageId);

  const { objects: listObjects } = useObjects(
    image?.mappedObjs?.map((o) => o[0]) || []
  );
  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);
  const { result: listOrbits } = useCachedPythonOutput(
    "get_orbit_calculations",
    listObjects &&
      location && {
        objects: listObjects,
        start_ts: startTs,
        end_ts: endTs,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      },
    {
      cacheKey: `imgOrbits_${imageId}_${startTs}_${endTs}_${
        location?.id
      }_${objectsToKey(listObjects)}`,
      staleCacheKey: `imgOrbits_${imageId}`,
    }
  );

  return (
    <CssVarsProvider theme={theme} defaultMode="dark" disableTransitionOnChange>
      <CssBaseline />
      <Layout.MobileTabs />
      <Layout.Root
        sx={{
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(64px, 200px) minmax(450px, 1fr)",
          },
        }}
      >
        <Layout.Header>
          <SubPageHeader title={image?.title} backPath={"/image/analyze"} />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={image?.title}
            items={[
              {
                text: "Captures",
                pathname: "/image/analyze",
                icon: ArrowBackIcon,
              },
            ]}
          />
        </Layout.SideNav>
        <Layout.Main>
          <Stack gap={1}>
            <ImageSheet
              image={image}
              objects={listObjects}
              orbits={listOrbits}
            />
            {image?.astrometryJobCalibrationsId && (
              <ImageLocationCard image={image} />
            )}
          </Stack>
          <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
