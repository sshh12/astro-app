import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItemButton from "@mui/joy/ListItemButton";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import Header from "../components/Header";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";
import SkyObjectsList from "../components/SkyObjectsList";
import { useBackend } from "../providers/backend";

function ListSideBar({ lists }) {
  const lsts = lists || [];
  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          Lists
        </ListSubheader>
        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          {lsts.map((lst) => (
            <ListItem key={lst.id}>
              <ListItemButton>
                <ListItemDecorator>
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "99px",
                      bgcolor: "primary.500",
                    }}
                  />
                </ListItemDecorator>
                <ListItemContent>{lst.title}</ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </ListItem>
    </List>
  );
}

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
            <SkySummarySheet />
            <SkyObjectsList objects={favoriteObjects} />
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
