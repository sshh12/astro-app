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
import Skeleton from "@mui/joy/Skeleton";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";
import SkyObjectsList from "../components/SkyObjectsList";
import { useBackend } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { getImageURL } from "../components/SkyObjectImage";
import Sheet from "@mui/joy/Sheet";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Typography from "@mui/joy/Typography";
import AvatarGroup from "@mui/joy/AvatarGroup";
import Avatar from "@mui/joy/Avatar";

function ListSideBar({ lists }) {
  const lsts =
    lists || Array.from({ length: 5 }).map((_, i) => ({ id: i, fake: true }));
  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          Lists
        </ListSubheader>
        <List
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          {lsts.map((lst) =>
            lst.fake ? (
              <ListItem key={lst.id}>
                <ListItemButton>
                  <ListItemContent>
                    <Skeleton variant="text"></Skeleton>
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            ) : (
              <ListItem key={lst.id}>
                <ListItemButton>
                  <ListItemDecorator>
                    <Box
                      sx={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "99px",
                        bgcolor: lst.color,
                      }}
                    />
                  </ListItemDecorator>
                  <ListItemContent>{lst.title}</ListItemContent>
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      </ListItem>
    </List>
  );
}

function ListMobileTab({ lists }) {
  const lsts = lists || [];
  return (
    <Sheet
      variant="outlined"
      sx={{
        display: { xs: "inherit", sm: "none" },
        borderRadius: "sm",
        overflow: "hidden",
        backgroundColor: "background.surface",
        gridColumn: "1/-1",
      }}
    >
      <Typography
        id="decorated-list-demo"
        level="body-xs"
        textTransform="uppercase"
        fontWeight="lg"
        mb={1}
        sx={{
          pt: 2,
          pl: 2,
        }}
      >
        Lists
      </Typography>
      <List
        size="sm"
        sx={{
          "--ListItemDecorator-size": "20px",
          "& .JoyListItemButton-root": { p: "8px" },
          pl: 1,
        }}
      >
        {lsts.map((lst) => {
          const avatarsObjs = lst.objects.slice(0, 3);
          const extras = lst.objects.length - avatarsObjs.length;
          return (
            <ListItem>
              <ListItemButton>
                <ListItemDecorator>
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "99px",
                      bgcolor: lst.color,
                    }}
                  />
                </ListItemDecorator>
                <ListItemContent>{lst.title}</ListItemContent>
                <AvatarGroup>
                  {avatarsObjs.map((obj) => (
                    <Avatar key={obj.id} src={getImageURL(obj)} />
                  ))}
                  {!!extras && <Avatar>+{extras}</Avatar>}
                </AvatarGroup>
                <KeyboardArrowRight />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Sheet>
  );
}

export default function SkyPage() {
  const { user, location } = useBackend();

  const favoriteObjects = user
    ? user.lists.find((lst) => lst.title === "Favorites").objects
    : null;

  const { result: favOrbits } = useCachedPythonOutput(
    "get_orbit_calculations",
    favoriteObjects &&
      location && {
        objects: favoriteObjects,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      },
    { cacheKey: "favOrbits", staleCacheKey: "favOrbits" }
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
            <SkySummarySheet objects={favoriteObjects} orbits={favOrbits} />
            <SkyObjectsList objects={favoriteObjects} orbits={favOrbits} />
            <ListMobileTab lists={user?.lists} />
            <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
