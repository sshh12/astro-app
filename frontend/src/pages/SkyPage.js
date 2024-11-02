import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Headers";
import Layout from "../components/Layout";
import { ListMobileTab, ListSideBar } from "../components/SkyListLists";
import SkyObjectsList from "../components/SkyObjectsList";
import SkySummarySheet from "../components/SkySummarySheet";
import { theme } from "../theme/theme";
import {
  renderTimeWithSeconds,
  useCurrentObservingWindow,
  useTimestamp,
} from "../utils/date";

export default function SkyPage() {
  const navigate = useNavigate();
  const user = null;
  const location = null;
  const showOnboarding = false;
  const { ts } = useTimestamp();

  React.useEffect(() => {
    if (showOnboarding) {
      navigate("/onboarding");
    }
  }, [navigate, showOnboarding]);

  const favoriteObjects = user
    ? user.lists.find((lst) => lst.title === "Favorites").objects
    : null;

  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);

  const favOrbits = null;
  const favOrbitsStale = null;

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
              gap: { xs: 1, sm: 2 },
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
