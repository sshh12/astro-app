import React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import { TabHeader } from "../components/Headers";
import { theme } from "../theme/theme";
import Stack from "@mui/joy/Stack";
import { SideBarNav } from "../components/Sidebars";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const LOCATION_TABS = [
  { label: "Weather", pathname: "/location/weather", icon: NightsStayIcon },
  {
    label: "Pollution",
    pathname: "/location/pollution",
    icon: LocationCityIcon,
  },
  { label: "Events", pathname: "/location/events", icon: CalendarMonthIcon },
];

export default function BaseImagePage({ tabIdx, children }) {
  const title = LOCATION_TABS[tabIdx].label;
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
          <TabHeader
            tabs={LOCATION_TABS.map((tab) => ({
              label: tab.label,
              pathname: tab.pathname,
            }))}
            tabIdx={tabIdx}
          />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={title}
            items={LOCATION_TABS.map((tab, i) => ({
              text: tab.label,
              icon: tab.icon,
              pathname: tab.pathname,
              selected: i === tabIdx,
            }))}
          />
        </Layout.SideNav>
        <Layout.Main>
          <Box sx={{ flex: 1, width: "100%", p: 0 }}>
            <Stack
              spacing={{ xs: 1, md: 3 }}
              sx={{
                display: "flex",
                maxWidth: "800px",
                mx: "auto",
                px: { xs: 0, md: 6 },
                py: { xs: 0, md: 3 },
              }}
            >
              {children}
            </Stack>
          </Box>
          <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
