import React, { useState, useEffect } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Layout from "../components/Layout";
import Skeleton from "@mui/joy/Skeleton";
import Select from "@mui/joy/Select";
import Grid from "@mui/joy/Grid";
import Option from "@mui/joy/Option";
import ListDivider from "@mui/joy/ListDivider";
import { SubPageHeader } from "../components/Headers";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";
import { useBackend, useObjects } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCurrentObservingWindow, useTimestamp } from "../utils/date";
import { SideBarNav } from "../components/Sidebars";
import { renderAz, renderLatLon } from "../utils/pos";
import { equipmentToDetails } from "../utils/equipment";
import SkyLongTermAltChart from "../charts/SkyLongTermAltChart";
import ObjectImage from "../components/SkyObjectImage";

function LiveLocationCard({ object, location }) {
  const { ts } = useTimestamp();
  const tsRoundedTo30s = Math.floor(ts / 30000) * 30000;
  const { result: orbitNow } = useCachedPythonOutput(
    "get_position_at_time",
    object &&
      location && {
        objects: [object],
        start_ts: tsRoundedTo30s,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
      },
    {
      cacheKey: `obj_pos_${tsRoundedTo30s}_${location?.id}_${object?.id}`,
      staleCacheKey: `obj_pos_${object?.id}`,
    }
  );
  const objPos = orbitNow && orbitNow[object?.id];
  const details = objPos
    ? [
        {
          name: "RA / DEC",
          value: `${objPos.ra.toFixed(2)} / ${objPos.dec.toFixed(2)}`,
        },
        {
          name: "ALT / AZ",
          value: `${Math.round(objPos.alt)}° / ${renderAz(
            Math.round(objPos.az)
          )}`,
        },
        {
          name: "LAT / LON",
          value: renderLatLon(objPos.lat, objPos.lon),
        },
      ]
    : [
        { name: "", value: undefined },
        { name: "", value: undefined },
        { name: "", value: undefined },
      ];
  return (
    <Card sx={{ p: 0, gap: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Position</Typography>
        </Stack>
        <Typography level="body-sm">
          The live location of this object.
        </Typography>
      </Box>
      <Divider sx={{ mb: 0 }} />
      <List sx={{ p: 1 }}>
        {details.map((d, idx) => (
          <>
            <ListItem>
              {d.value !== undefined && (
                <ListItemContent>
                  <Typography level="body-sm" fontWeight="lg">
                    {d.name}
                  </Typography>
                </ListItemContent>
              )}
              {d.value !== undefined && (
                <Typography level="body-sm">{d.value}</Typography>
              )}
              {d.value === undefined && <Skeleton variant="text"></Skeleton>}
            </ListItem>
            {idx < details.length - 1 && <ListDivider />}
          </>
        ))}
      </List>
    </Card>
  );
}

function LongTermPositionsCard({
  location,
  object,
  longOrbit,
  longOrbitStale,
  longOrbitsStreaming,
}) {
  return (
    <Card sx={{ p: 0, gap: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Annual Position</Typography>
        </Stack>
        {!longOrbitsStreaming && (
          <Typography level="body-sm">
            The location of this object throughout the year.
          </Typography>
        )}
        {longOrbitsStreaming && (
          <Typography level="body-sm">Generating...</Typography>
        )}
      </Box>
      <Divider sx={{ mb: 0 }} />
      {location && object && longOrbit ? (
        <Box sx={{ height: "16rem" }}>
          <SkyLongTermAltChart
            object={object}
            longOrbit={longOrbit}
            stale={longOrbitStale}
            timezone={location.timezone}
          />
        </Box>
      ) : (
        <Box>
          <Skeleton variant="text" />
        </Box>
      )}
    </Card>
  );
}

function SkySurveysCard({ object }) {
  const { user } = useBackend();
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (user && user.equipment.length > 0) {
      const active = user.equipment.find((eq) => eq.active);
      if (active) {
        setSelectedId(active.id);
      }
    }
  }, [user]);
  const equipment = user?.equipment || [];
  equipment.sort((a, b) => (a.active ? -1 : b.active ? 1 : 0));
  const eqSelected = equipment.find((eq) => eq.id === selectedId);
  const skySurveys = [
    { name: "DSS2", hips: "CDS/P/DSS2/color" },
    { name: "SDSS9", hips: "CDS/P/SDSS9/color" },
    { name: "allWISE", hips: "CDS/P/allWISE/color" },
    { name: "2MASS", hips: "CDS/P/2MASS/color" },
  ];
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">Sky Surveys</Typography>
        <Typography level="body-sm">Sky renders for your equipment.</Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          px: 1,
          py: 0.5,
          maxWidth: "90vw",
          justifyContent: "center",
          margin: "auto",
        }}
      >
        <Select
          value={selectedId}
          onChange={(e, v) => setSelectedId(v)}
          size="sm"
          sx={{ flexGrow: 1 }}
        >
          {equipment.map((eq) => (
            <Option key={eq.id} value={eq.id}>
              {equipmentToDetails(eq).title}
            </Option>
          ))}
        </Select>
      </Box>
      <Box sx={{ p: 1 }}>
        {object && (
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            {skySurveys.map((ss) => (
              <Grid xs={6} sx={{ border: "3px solid", borderColor: "divider" }}>
                <ObjectImage
                  key={eqSelected?.id}
                  object={object}
                  equipment={eqSelected}
                  source={ss.hips}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Card>
  );
}

export default function SkyObjectPage() {
  const { id: objectId } = useParams();
  const { objects } = useObjects([objectId]);
  const { location } = useBackend();
  const object = objects && objects[0];

  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);
  const { result: orbits, stale: orbitsStale } = useCachedPythonOutput(
    "get_orbit_calculations",
    object &&
      location && {
        objects: [object],
        start_ts: startTs,
        end_ts: endTs,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      },
    {
      cacheKey: `orbits_${startTs}_${endTs}_${location?.id}_${objectId}`,
      staleCacheKey: `orbits_${objectId}`,
    }
  );

  const { ts } = useTimestamp();
  const tsRoundedToOneMonth =
    Math.floor(ts / 1000 / 60 / 60 / 24 / 30) * 1000 * 60 * 60 * 24 * 30;
  const {
    result: longOrbit,
    stale: longOrbitStale,
    streaming: longOrbitsStreaming,
  } = useCachedPythonOutput(
    "get_longterm_orbit_calculations",
    object &&
      location && {
        object: object,
        first_period_start_ts: startTs,
        first_period_end_ts: endTs,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        start_days: 0,
        offset_days: 365,
      },
    {
      cacheKey: `obj_long_${tsRoundedToOneMonth}_${location?.id}_${object?.id}`,
      staleCacheKey: `obj_long_${object?.id}`,
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
          <SubPageHeader title={object?.name || "Object"} backPath={"/sky"} />
        </Layout.Header>
        <Layout.SideNav>
          <SideBarNav
            title={object?.name || "Object"}
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: { xs: 0.5, sm: 2 },
            }}
          >
            <SkySummarySheet
              objects={objects}
              orbits={orbits}
              stale={orbitsStale}
            />
          </Box>
          <Box sx={{ flex: 1, width: "100%", p: 0, mt: 1 }}>
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
              <LiveLocationCard object={object} location={location} />
              <LongTermPositionsCard
                object={object}
                longOrbit={longOrbit}
                longOrbitStale={longOrbitStale}
                longOrbitsStreaming={longOrbitsStreaming}
                location={location}
              />
              <SkySurveysCard object={object} />
            </Stack>
          </Box>
          <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
