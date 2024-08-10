import React, { useState, useEffect } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import { SubPageHeader } from "../components/Headers";
import { theme } from "../theme/theme";
import { useBackend, usePost } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { objectsToKey } from "../utils/object";
import { useCurrentObservingWindow } from "../utils/date";
import { SideBarNav } from "../components/Sidebars";
import Sheet from "@mui/joy/Sheet";
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import Textarea from "@mui/joy/Textarea";
import Button from "@mui/joy/Button";
import SkyObjectsList from "../components/SkyObjectsList";
import { useStorage } from "../providers/storage";
import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/joy";

const cleanSearchTerm = (term) => {
  if (term.startsWith("NAME ")) {
    term = term.slice(5);
  }
  return term.replace(/[^\w0-9]+/g, "").toLowerCase();
};

function SearchParamsCard({ loading }) {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get("q");
  const d = new URLSearchParams(location.search).get("d");
  const navigate = useNavigate();

  const [nameInput, setNameInput] = useState(q || "");
  const [descInput, setDescInput] = useState(d || "");
  return (
    <Sheet
      sx={{ p: 0, maxWidth: "400px", borderRadius: "sm" }}
      variant="outlined"
    >
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">Find Objects</Typography>
        <Typography level="body-sm">
          Get objects by name or description.
        </Typography>
      </Box>
      <Divider />
      <Stack sx={{ padding: 2 }} gap={2}>
        <Box>
          <Typography level="body-sm" sx={{ pb: 1 }}>
            <b>By Name</b>
          </Typography>
          <Input
            placeholder={"M 31"}
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setDescInput("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/sky/search?q=${nameInput}&d=${descInput}`);
              }
            }}
          />
        </Box>
        <Box>
          <Typography level="body-sm" sx={{ pb: 1 }}>
            <b>
              By Description{" "}
              <Tooltip title="Limited to DSOs and Planets. Produced via Generative AI and may be inaccurate.">
                <Info sx={{ fontSize: "1rem" }} />
              </Tooltip>
            </b>
          </Typography>
          <Textarea
            minRows={2}
            value={descInput}
            placeholder="Show me colorful galaxies based on my equipment specs..."
            onChange={(e) => {
              setDescInput(e.target.value);
              setNameInput("");
            }}
          />
        </Box>
      </Stack>
      <Stack direction="row" sx={{ padding: 2 }} justifyContent={"end"}>
        <Button
          endDecorator={<SearchIcon />}
          color="primary"
          size="sm"
          onClick={() => navigate(`/sky/search?q=${nameInput}&d=${descInput}`)}
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
  const d = new URLSearchParams(navLocation.search).get("d");
  const anySearch = q || d;
  const { objectStore } = useStorage();
  const [localObjects, setLocalObjects] = useState([]);
  const [remoteObjects, setRemoteObjects] = useState([]);

  useEffect(() => {
    if (!objectStore || !q) {
      setLocalObjects([]);
      return;
    }
    const cleanTerm = cleanSearchTerm(q);
    (async () => {
      const matches = [];
      await objectStore.iterate((val) => {
        if (val.searchKey.includes(cleanTerm)) {
          matches.push(val);
        }
      });
      setLocalObjects(matches);
    })();
  }, [q, d, objectStore]);

  useEffect(() => {
    if (!post || !anySearch) {
      console.log(post, anySearch);
      setRemoteObjects([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const resp = await post("search", { term: q, prompt: d });
        setRemoteObjects(resp.objects);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
        setRemoteObjects([]);
        return;
      }
    })();
  }, [anySearch, post, q, d, setLoading]);

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
      cacheKey: `searchOrbits_${q}_${d}_${startTs}_${endTs}_${
        location?.id
      }_${objectsToKey(listObjects)}`,
      staleCacheKey: `searchOrbits_${q}_${d}`,
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
