import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import { Header } from "../components/Headers";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";
import SkyObjectsList from "../components/SkyObjectsList";
import { useBackend } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import {
  renderTimeWithSeconds,
  useTimestamp,
  useCurrentObservingWindow,
} from "../utils/date";
import { objectsToKey } from "../utils/object";
import { useNavigate } from "react-router-dom";
import { ListSideBar, ListMobileTab } from "../components/SkyListLists";

export default function SkyPage() {
  const navigate = useNavigate();
  const { user, location, showOnboarding } = useBackend();
  const { ts } = useTimestamp();

  React.useEffect(() => {
    if (showOnboarding) {
      navigate("/onboarding");
    }
  }, [navigate, showOnboarding]);

  const favoriteObjects = user
    ? user.lists.find((lst) => lst.title === "Favorites").objects
    : null;

  const [startTs, endTs] = useCurrentObservingWindow(user?.timezone);

  const { result: favOrbits, stale: favOrbitsStale } = useCachedPythonOutput(
    "get_orbit_calculations",
    favoriteObjects &&
      location && {
        objects: favoriteObjects,
        start_ts: startTs,
        end_ts: endTs,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      },
    {
      cacheKey: `favOrbits_${startTs}_${endTs}_${location?.id}_${objectsToKey(
        favoriteObjects
      )}`,
      staleCacheKey: "favOrbits",
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
          <Header
            title="Sky"
            subtitle={renderTimeWithSeconds(ts, user?.timezone)}
            enableSearch={true}
          />
        </Layout.Header>
        <Layout.SideNav>
          <ListSideBar lists={user?.lists} />
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
              objects={favoriteObjects}
              orbits={favOrbits}
              stale={favOrbitsStale}
            />
            <ListMobileTab lists={user?.lists} />
            <SkyObjectsList objects={favoriteObjects} orbits={favOrbits} />
            <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
