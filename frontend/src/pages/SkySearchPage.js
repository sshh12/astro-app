import { Info } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { Tooltip } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import Divider from "@mui/joy/Divider";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import { CssVarsProvider } from "@mui/joy/styles";
import Textarea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SubPageHeader } from "../components/Headers";
import Layout from "../components/Layout";
import { SideBarNav } from "../components/Sidebars";
import SkyObjectsList from "../components/SkyObjectsList";
import { useCachedPythonOutput } from "../providers/python";
import { theme } from "../theme/theme";
import { useCurrentObservingWindow } from "../utils/date";
import { objectsToKey } from "../utils/object";

function SearchParamsCard({ loading }) {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get("q");
  const navigate = useNavigate();
  const [descInput, setDescInput] = useState(q || "");
  return (
    <Sheet
      sx={{ p: 0, maxWidth: "400px", borderRadius: "sm" }}
      variant="outlined"
    >
      <Box sx={{ mb: 2, pt: 2, px: 2 }}>
        <Typography level="title-md">Find Objects</Typography>
      </Box>
      <Divider />
      <Stack sx={{ padding: 2 }} gap={2}>
        <Box>
          <Typography level="body-sm" sx={{ pb: 1 }}>
            <b>
              Name or Description{" "}
              <Tooltip
                title="Limited to DSOs and Planets. Uses Generative AI and may be inaccurate."
                enterTouchDelay={100}
                enterDelay={100}
              >
                <Info sx={{ fontSize: "1rem" }} />
              </Tooltip>
            </b>
          </Typography>
          <Textarea
            minRows={2}
            value={descInput}
            placeholder="NGC 1234, Show me colorful galaxies based on my equipment specs..."
            onChange={(e) => {
              setDescInput(e.target.value);
            }}
          />
        </Box>
      </Stack>
      <Stack direction="row" sx={{ padding: 2 }} justifyContent={"end"}>
        <Button
          endDecorator={<SearchIcon />}
          color="primary"
          size="sm"
          onClick={() => navigate(`/sky/search?q=${descInput}`)}
          loading={loading}
        >
          Search
        </Button>
      </Stack>
    </Sheet>
  );
}

function dedupObjs(objs) {
  const seen = new Set();
  return objs.filter((obj) => {
    if (seen.has(obj.id)) {
      return false;
    }
    seen.add(obj.id);
    return true;
  });
}

function SearchResults({ setLoading }) {
  const navLocation = useLocation();
  const { location } = useBackend();
  const { post } = usePost();
  const q = new URLSearchParams(navLocation.search).get("q");
  const anySearch = !!q;
  const [localObjects, setLocalObjects] = useState([]);
  const [remoteObjects, setRemoteObjects] = useState([]);


  useEffect(() => {
    if (!post || !anySearch) {
      console.log(post, anySearch);
      setRemoteObjects([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const resp = await post("search", { prompt: q });
        setRemoteObjects(resp.objects);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
        setRemoteObjects([]);
        return;
      }
    })();
  }, [anySearch, post, q, setLoading]);

  const listObjects = dedupObjs([...localObjects, ...remoteObjects]);

  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);
  const { result: listOrbits } = useCachedPythonOutput(
    "get_orbit_calculations",
    listObjects &&
      location && {
        objects: listObjects,
        start_ts: startTs,
        end_ts: endTs,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      },
    {
      cacheKey: `searchOrbits_${q}_${startTs}_${endTs}_${
        location?.id
      }_${objectsToKey(listObjects)}`,
      staleCacheKey: `searchOrbits_${q}`,
    }
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: { xs: 1, sm: 2 },
        marginTop: 3,
      }}
    >
      {anySearch && (
        <SkyObjectsList objects={listObjects} orbits={listOrbits} />
      )}
      <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
    </Box>
  );
}

export default function SkySearchPage() {
  const [loading, setLoading] = useState(false);
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
          <SubPageHeader
            title={"Search"}
            backPath={"/sky"}
            enableSearch={false}
          />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={"Search"}
            items={[
              {
                text: "Favorites",
                pathname: "/sky",
                icon: ArrowBackIcon,
              },
            ]}
          />
        </Layout.SideNav>
        <Layout.Main>
          <Stack gap={1}>
            <SearchParamsCard loading={loading} />
          </Stack>
          <SearchResults setLoading={setLoading} />
          <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
