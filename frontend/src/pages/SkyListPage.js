import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import * as React from "react";
import { useParams } from "react-router-dom";
import { SubPageHeader } from "../components/Headers";
import Layout from "../components/Layout";
import { SideBarNav } from "../components/Sidebars";
import SkyObjectsList from "../components/SkyObjectsList";
import SkySummarySheet from "../components/SkySummarySheet";
import { useCachedPythonOutput } from "../providers/python";
import { theme } from "../theme/theme";
import { useCurrentObservingWindow } from "../utils/date";
import { objectsToKey } from "../utils/object";

export default function SkyListPage() {
  const { id: listId } = useParams();
  const { list } = useList(listId);
  const { location } = useBackend();

  const listObjects = list ? list.objects : null;
  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);
  const { result: listOrbits, stale: listOrbitsStale } = useCachedPythonOutput(
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
      cacheKey: `listOrbits_${listId}_${startTs}_${endTs}_${
        location?.id
      }_${objectsToKey(listObjects)}`,
      staleCacheKey: `listOrbits_${listId}`,
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
          <SubPageHeader title={list?.title || "List"} backPath={"/sky"} />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={list?.title || "List"}
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
            <SkySummarySheet
              objects={listObjects}
              orbits={listOrbits}
              stale={listOrbitsStale}
            />
            <SkyObjectsList objects={listObjects} orbits={listOrbits} />
            <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
