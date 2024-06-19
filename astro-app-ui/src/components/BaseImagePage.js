import React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import { TabHeader } from "../components/Headers";
import { theme } from "../theme/theme";
import Stack from "@mui/joy/Stack";
import { SideBarNav } from "../components/Sidebars";
import { Camera, Calculate } from "@mui/icons-material";

const IMAGE_TABS = [
  { label: "Capture", pathname: "/image/capture", icon: Camera },
  { label: "Equipment", pathname: "/image/equipment", icon: Calculate },
];

export default function BaseImagePage({ tabIdx, children }) {
  const title = IMAGE_TABS[tabIdx].label;
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
            tabs={IMAGE_TABS.map((tab) => ({
              label: tab.label,
              pathname: tab.pathname,
            }))}
            tabIdx={tabIdx}
          />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={title}
            items={IMAGE_TABS.map((tab, i) => ({
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
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
