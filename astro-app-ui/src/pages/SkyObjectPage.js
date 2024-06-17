import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import { SubPageHeader } from "../components/Headers";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";
import { useBackend, useObjects } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCurrentObservingWindow } from "../utils/date";
import { SideBarNav } from "../components/Sidebars";

export default function SkyObjectPage() {
  const { id: objectId } = useParams();
  const { objects } = useObjects([objectId]);
  const { location, user } = useBackend();
  const object = objects && objects[0];

  const [startTs, endTs] = useCurrentObservingWindow(user?.timezone);
  const { result: orbits } = useCachedPythonOutput(
    "get_orbit_calculations",
    object &&
      location && {
        objects: [object],
        start_ts: startTs,
        end_ts: endTs,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      },
    {
      cacheKey: `orbits_${startTs}_${endTs}_${location?.id}_${objectId}`,
      staleCacheKey: `orbits_${objectId}`,
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
          <SubPageHeader title={object?.name || "Object"} backPath={"/sky"} />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={object?.name || "Object"}
            items={[
              {
                text: "Favorites",
                pathname: "/sky",
                icon: ArrowBackIcon,
              },
            ]}
          />
        </Layout.SideNav>
        <Layout.Main>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: { xs: 0.5, sm: 2 },
            }}
          >
            <SkySummarySheet objects={objects} orbits={orbits} />
            <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
