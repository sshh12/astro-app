import { AccountTree, Calculate } from "@mui/icons-material";
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import Stack from "@mui/joy/Stack";
import { CssVarsProvider } from "@mui/joy/styles";
import React from "react";
import { TabHeader } from "../components/Headers";
import Layout from "../components/Layout";
import { SideBarNav } from "../components/Sidebars";
import { theme } from "../theme/theme";

const IMAGE_TABS = [
  { label: "Analyze", pathname: "/image/analyze", icon: AccountTree },
  { label: "Equipment", pathname: "/image/equipment", icon: Calculate },
];

export default function BaseImagePage({
  tabIdx,
  children,
  maxWidth = "800px",
}) {
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
                maxWidth: maxWidth,
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
