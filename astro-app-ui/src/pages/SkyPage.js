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
import { Header } from "../components/Headers";
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
import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionSummary from "@mui/joy/AccordionSummary";
import AccordionDetails from "@mui/joy/AccordionDetails";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ListIcon from "@mui/icons-material/List";
import { Link } from "react-router-dom";
import {
  renderTimeWithSeconds,
  useTimestamp,
  useCurrentObservingWindow,
} from "../utils/date";
import { objectsToKey } from "../utils/object";
import { idxToColorHex } from "../constants/colors";
import { useNavigate } from "react-router-dom";
import { CURATED_LISTS } from "./../constants/lists";

function Toggler({ defaultExpanded = false, renderToggle, children }) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "0.2s ease",
          "& > *": {
            overflow: "hidden",
          },
        }}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

function RichListSideBarItem({ list, idx }) {
  return list.fake ? (
    <ListItem key={list.id}>
      <ListItemButton>
        <ListItemContent>
          <Skeleton variant="text"></Skeleton>
        </ListItemContent>
      </ListItemButton>
    </ListItem>
  ) : (
    <Link
      to={{ pathname: `/sky/list/${list.id}` }}
      style={{ textDecoration: "none" }}
      key={list.id}
    >
      <ListItem>
        <ListItemButton>
          <ListItemDecorator>
            <Box
              sx={{
                width: "10px",
                height: "10px",
                borderRadius: "99px",
                bgcolor: idxToColorHex(idx),
              }}
            />
          </ListItemDecorator>
          <ListItemContent>{list.title}</ListItemContent>
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

function ListSideBar({ lists }) {
  const lsts =
    (lists && lists.filter((lst) => lst.title !== "Favorites")) ||
    Array.from({ length: 5 }).map((_, i) => ({ id: i, fake: true }));
  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          Sky
        </ListSubheader>
        <List
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          {lsts.map((lst, idx) => (
            <RichListSideBarItem list={lst} key={lst.id} idx={idx} />
          ))}
        </List>
      </ListItem>
      <ListItem nested>
        <Toggler
          renderToggle={({ open, setOpen }) => (
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListIcon />
              <ListItemContent>
                <Typography level="title-sm">More Lists</Typography>
              </ListItemContent>
              <KeyboardArrowDownIcon
                sx={{ transform: open ? "rotate(180deg)" : "none" }}
              />
            </ListItemButton>
          )}
        >
          <List
            size="sm"
            sx={{
              "--ListItemDecorator-size": "20px",
              "& .JoyListItemButton-root": { p: "8px" },
            }}
          >
            {CURATED_LISTS.map((lst, idx) => (
              <RichListSideBarItem
                list={lst}
                key={lst.id}
                idx={lsts.length + idx}
              />
            ))}
          </List>
        </Toggler>
      </ListItem>
    </List>
  );
}

function RichListListItem({ list, idx }) {
  if (list.fake) {
    return (
      <ListItem key={list.id}>
        <ListItemButton>
          <ListItemContent>
            <Skeleton variant="text"></Skeleton>
          </ListItemContent>
        </ListItemButton>
      </ListItem>
    );
  }
  const avatarsObjs = list.objects.slice(0, 3);
  const extras = list.objects.length - avatarsObjs.length;
  return (
    <Link
      to={{ pathname: `/sky/list/${list.id}` }}
      style={{ textDecoration: "none" }}
      key={list.id}
    >
      <ListItem>
        <ListItemButton>
          <ListItemDecorator>
            <Box
              sx={{
                width: "10px",
                height: "10px",
                borderRadius: "99px",
                bgcolor: idxToColorHex(idx),
              }}
            />
          </ListItemDecorator>
          <ListItemContent>
            <Typography fontSize={"0.9rem"}>{list.title}</Typography>
          </ListItemContent>
          <AvatarGroup>
            {avatarsObjs.map((obj) => (
              <Avatar key={obj.id} src={getImageURL(obj)} />
            ))}
            {!!extras && <Avatar>+{Math.min(extras, 99)}</Avatar>}
          </AvatarGroup>
          <KeyboardArrowRight />
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

function ListMobileTab({ lists }) {
  const lsts =
    (lists && lists.filter((lst) => lst.title !== "Favorites")) ||
    Array.from({ length: 5 }).map((_, i) => ({ id: i, fake: true }));
  return (
    <Sheet
      variant="outlined"
      sx={{
        display: { xs: "inherit", sm: "none" },
        borderRadius: "sm",
        overflow: "hidden",
        backgroundColor: "background.surface",
        gridColumn: "1/-1",
        paddingBottom: 2,
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
        {lsts.map((lst, idx) => (
          <RichListListItem list={lst} key={lst.id} idx={idx} />
        ))}
      </List>
      <AccordionGroup>
        <Accordion>
          <AccordionSummary>
            <Typography level="body-sm">More Lists</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List
              size="sm"
              sx={{
                "--ListItemDecorator-size": "20px",
                "& .JoyListItemButton-root": { p: "8px" },
                pl: 1,
              }}
            >
              {CURATED_LISTS.map((lst, idx) => (
                <RichListListItem
                  list={lst}
                  key={lst.id}
                  idx={lsts.length + idx}
                />
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Sheet>
  );
}

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
