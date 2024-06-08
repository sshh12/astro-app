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
import { SubPageHeader } from "../components/Headers";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";
import SkyObjectsList from "../components/SkyObjectsList";
import { useBackend, useList } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function SideBar({ list }) {
  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          {list?.title || "List"}
        </ListSubheader>
        <List
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          <Link to={{ pathname: `/sky` }} style={{ textDecoration: "none" }}>
            <ListItem>
              <ListItemButton>
                {" "}
                <ListItemDecorator>
                  <ArrowBackIcon />
                </ListItemDecorator>
                <ListItemContent>Favorites</ListItemContent>
              </ListItemButton>
            </ListItem>
          </Link>
        </List>
      </ListItem>
    </List>
  );
}

export default function SkyListPage() {
  const { id: listId } = useParams();
  const { list } = useList(listId);
  const { location } = useBackend();

  const listObjects = list ? list.objects : null;

  const { result: listOrbits } = useCachedPythonOutput(
    "get_orbit_calculations",
    listObjects &&
      location && {
        objects: listObjects,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      },
    { cacheKey: `listOrbits${listId}`, staleCacheKey: `listOrbits${listId}` }
  );

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
          <SubPageHeader title={list?.title || "List"} backPath={"/sky"} />
        </Layout.Header>
        <Layout.SideNav>
          <SideBar list={list} />
        </Layout.SideNav>
        <Layout.Main>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: { xs: 0.5, sm: 2 },
            }}
          >
            <SkySummarySheet objects={listObjects} orbits={listOrbits} />
            <SkyObjectsList objects={listObjects} orbits={listOrbits} />
            <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
