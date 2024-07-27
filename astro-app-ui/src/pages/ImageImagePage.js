import React, { useState } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import { SubPageHeader } from "../components/Headers";
import { theme } from "../theme/theme";
import SkyObjectsList from "../components/SkyObjectsList";
import { useBackend, useObjects } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { objectsToKey } from "../utils/object";
import { useCurrentObservingWindow } from "../utils/date";
import { SideBarNav } from "../components/Sidebars";
import Sheet from "@mui/joy/Sheet";
import OverlayImage from "../components/OverlayImage";
import Card from "@mui/joy/Card";
import Divider from "@mui/joy/Divider";
import AspectRatio from "@mui/joy/AspectRatio";
import Slider from "@mui/joy/Slider";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
          <SubPageHeader title={image?.title} backPath={"/image/capture"} />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={image?.title}
            items={[
              {
                text: "Captures",
                pathname: "/image/capture",
                icon: ArrowBackIcon,
              },
            ]}
          />
        </Layout.SideNav>
        <Layout.Main>
          <Stack gap={1}>
            <Sheet variant="outlined">
              <Box sx={{ width: "100%", height: "100%" }}>
                <TransformWrapper maxScale={100}>
                  <TransformComponent>
                    <OverlayImage image={image} objects={listObjects} />
                  </TransformComponent>
                </TransformWrapper>
              </Box>
            </Sheet>
            {image?.astrometryJobCalibrationsId && (
              <ImageLocationCard image={image} />
            )}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: { xs: 0.5, sm: 2 },
                marginTop: "1rem",
              }}
            >
              {listObjects && (
                <SkyObjectsList objects={listObjects} orbits={listOrbits} />
              )}
            </Box>
          </Stack>
          <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
