import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";
import SkyObjectsList from "../components/SkyObjectsList";
import { useBackend } from "../providers/backend";

export default function SkyPage() {
  const { user } = useBackend();

  const favoriteObjects = user
    ? user.lists.find((lst) => lst.title === "Favorites").objects
    : null;
  console.log(user);
  return (
    <CssVarsProvider theme={theme} disableTransitionOnChange>
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
          <Header title="Sky" subtitle="3:33:45 PM" />
        </Layout.Header>
        <Layout.SideNav>
          <SideBar />
        </Layout.SideNav>
        <Layout.Main>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: { xs: 0.5, sm: 2 },
            }}
          >
            <SkySummarySheet />
            <SkyObjectsList objects={favoriteObjects} />
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
