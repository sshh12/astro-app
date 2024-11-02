import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import {
  AspectRatio,
  Box,
  Button,
  Card,
  CardActions,
  CardOverflow,
  Chip,
  Divider,
  Dropdown,
  IconButton,
  ListDivider,
  Menu,
  MenuButton,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/joy";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BaseLocationPage from "../components/BaseLocationPage";
import { ColorTabs } from "../components/ColorTabs";
import { useBackend } from "../providers/backend";
import { useCachedPythonOutput } from "../providers/python";
import { useStorage } from "../providers/storage";
import {
  cloudCoverToBadge,
  getTwlightName,
  moonPctToIcon,
  precipitationToBadge,
  summaryToBadge,
  twilightToColor,
  visibilityToBadge,
} from "../utils/weather";
import {
  idxContains,
  renderTime,
  useCurrentObservingWindow,
  useTimestamp,
} from "./../utils/date";

function useWeather(location) {
  const [meteoData, setMeteoData] = useState(null);
  const { ts } = useTimestamp();
  const tsNowRoundedToHour = Math.floor(ts / 3600000) * 3600000;
  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);

  useEffect(() => {
    if (location) {
      (async () => {
        const meteoResp = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=precipitation_probability,cloud_cover,visibility&daily=weather_code&timezone=${location.timezone}#${tsNowRoundedToHour}`
        );
        const meteoData = await meteoResp.json();
        if (!meteoData.error) {
          setMeteoData(meteoData);
        } else {
          alert("Weather: " + meteoData.reason);
        }
      })();
    }
  }, [location, tsNowRoundedToHour]);

  const { result: weather, stale } = useCachedPythonOutput(
    "get_week_info_with_weather_data",
    meteoData &&
      location && {
        weather_data: meteoData,
        start_ts: startTs,
        end_ts: endTs,
        lat: location?.lat,
        lon: location?.lon,
        timezone: location?.timezone,
        elevation: location?.elevation,
      },
    {
      cacheKey: `weather_${location?.id}_${tsNowRoundedToHour}`,
      staleCacheKey: `weather_${startTs}`,
    }
  );

  return { weather, stale };
}

function useWFO(location) {
  const { cacheStore } = useStorage();
  const [wfo, setWFO] = useState(null);
  const cacheKey = location ? `wfo_${location.lat}_${location.lon}` : null;
  useEffect(() => {
    if (location && cacheKey && cacheStore) {
      (async () => {
        const cachedWFO = await cacheStore.getItem(cacheKey);
        if (cachedWFO === "NONE") {
          return;
        }
        if (!cachedWFO) {
          const response = await fetch(
            `https://api.weather.gov/points/${location.lat},${location.lon}`
          );
          const data = await response.json();
          try {
            const wfo = data.properties.cwa;
            setWFO(wfo);
            cacheStore.setItem(cacheKey, wfo);
          } catch (e) {
            console.error("WFO", e);
            cacheStore.setItem(cacheKey, "NONE");
          }
        } else {
          setWFO(cachedWFO);
        }
      })();
    }
  }, [location, cacheKey, cacheStore]);
  return { wfo };
}

function ForecastDay({ dateInfo }) {
  const { ts } = useTimestamp();
  const { displaySettings } = useBackend();
  const { skyTabs, cloudTabs, precTabs, visTabs, sumTabs } = useMemo(() => {
    if (!dateInfo) {
      return {
        skyTabs: [],
        cloudTabs: [],
        precTabs: [],
        visTabs: [],
        sumTabs: [],
      };
    }
    const idxs = [...Array(dateInfo.time.length).keys()];
    const skyTabs = idxs.map((i) => ({
      tooltip: `${getTwlightName(dateInfo.twilight_state[i])} at ${renderTime(
        dateInfo.time[i]
      )}`,
      color: twilightToColor(dateInfo.twilight_state[i]),
    }));
    const cloudTabs = idxs.map((i) =>
      cloudCoverToBadge({
        ts: dateInfo.time[i],
        cloudCover: dateInfo.cloud_cover[i],
      })
    );
    const precTabs = idxs.map((i) =>
      precipitationToBadge({
        ts: dateInfo.time[i],
        precipitation: dateInfo.precipitation_probability[i],
      })
    );
    const visTabs = idxs.map((i) =>
      visibilityToBadge({
        ts: dateInfo.time[i],
        visibility: dateInfo.visibility[i],
      })
    );
    const sumTabs = idxs.map((i) =>
      summaryToBadge({
        ts: dateInfo.time[i],
        twilightState: dateInfo.twilight_state[i],
        cloudCover: dateInfo.cloud_cover[i],
        precipitation: dateInfo.precipitation_probability[i],
        visibility: dateInfo.visibility,
      })
    );
    return { skyTabs, cloudTabs, precTabs, visTabs, sumTabs };
  }, [dateInfo]);

  if (!dateInfo) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Skeleton variant="text"></Skeleton>
        </Stack>
      </Box>
    );
  }

  const idxNow = idxContains(dateInfo.time || [], ts);
  const MoonIcon = moonPctToIcon(dateInfo.moon_illumination);
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between" }}>
        <Typography level="title-md">
          {dateInfo.start_weekday} - {dateInfo.end_weekday}
        </Typography>
        <Link
          to={{ pathname: "/sky/object/944241943867162625" }}
          style={{ textDecoration: "none" }}
        >
          <Chip variant="solid" startDecorator={<MoonIcon />}>
            {Math.round(dateInfo.moon_illumination)}%
          </Chip>
        </Link>
      </Stack>
      {displaySettings && displaySettings.forecastExpanded && (
        <Stack spacing={2}>
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Day / Night
            </Typography>
            <ColorTabs tabs={skyTabs} outlineIdx={idxNow} />
          </Box>
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Clouds
            </Typography>
            <ColorTabs tabs={cloudTabs} outlineIdx={idxNow} />
          </Box>
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Precipitation
            </Typography>
            <ColorTabs tabs={precTabs} outlineIdx={idxNow} />
          </Box>
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Visability
            </Typography>
            <ColorTabs tabs={visTabs} outlineIdx={idxNow} />
          </Box>
        </Stack>
      )}
      {displaySettings && !displaySettings.forecastExpanded && (
        <Stack spacing={2}>
          <Box>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Observing Conditions
            </Typography>
            <ColorTabs tabs={sumTabs} outlineIdx={idxNow} />
          </Box>
        </Stack>
      )}
    </Box>
  );
}

function ForecastOptions() {
  const { displaySettings, setDisplaySettings } = useBackend();
  return (
    <Dropdown>
      <MenuButton
        variant="plain"
        size="sm"
        sx={{
          maxWidth: "32px",
          maxHeight: "32px",
          borderRadius: "9999999px",
        }}
      >
        <IconButton component="span" variant="plain" color="neutral" size="sm">
          <MoreVertRoundedIcon />
        </IconButton>
      </MenuButton>
      <Menu
        placement="bottom-end"
        size="sm"
        sx={{
          zIndex: "99999",
          p: 1,
          gap: 1,
          "--ListItem-radius": "var(--joy-radius-sm)",
        }}
      >
        {displaySettings && displaySettings.forecastExpanded && (
          <MenuItem
            onClick={() =>
              setDisplaySettings({
                ...displaySettings,
                forecastExpanded: false,
              })
            }
          >
            Switch to minimal view
          </MenuItem>
        )}
        {displaySettings && !displaySettings.forecastExpanded && (
          <MenuItem
            onClick={() =>
              setDisplaySettings({
                ...displaySettings,
                forecastExpanded: true,
              })
            }
          >
            Switch to expanded view
          </MenuItem>
        )}
      </Menu>
    </Dropdown>
  );
}

function WeekForecastCard({ location }) {
  const { weather } = useWeather(location);
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ pt: 2, px: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems={"center"}
        >
          <Typography level="title-md">Forecast</Typography>
          <ForecastOptions />
        </Stack>
      </Box>
      <Divider />
      {weather &&
        weather.map((dateInfo, idx) => (
          <>
            <ForecastDay dateInfo={dateInfo} />
            {idx < weather.length - 1 && <ListDivider />}
          </>
        ))}
      {!weather &&
        [0, 1, 2, 3, 4, 5, 6].map((_, idx) => (
          <>
            <ForecastDay />
            {idx < 7 - 1 && <ListDivider />}
          </>
        ))}
      <Divider />
      <CardOverflow sx={{ paddingRight: 2, paddingBottom: 2 }}>
        <CardActions sx={{ alignSelf: "flex-end", gap: 2 }}>
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              window.open(
                `https://www.astrospheric.com/?Latitude=${location.lat}&Longitude=${location.lon}&Loc=Forecast`
              )
            }
          >
            Astrospheric
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              window.open(
                `https://clearoutside.com/forecast/${location.lat}/${location.lon}`
              )
            }
          >
            Clear Outside
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}

function GOESImage({ wfo }) {
  const [urlKey, setUrlKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewStatic, setViewStatis] = useState(true);
  const [supportsStatic, setSupportsStatic] = useState(true);
  const [supportsGOES18, setSupportsGOES18] = useState(true);
  const [supportsGOES16, setSupportsGOES16] = useState(true);
  const imgStyle = {
    width: "100%",
    height: "auto",
    display: loading ? "none" : "inherit",
    borderRadius: "0.1rem",
  };
  useEffect(() => {
    const refresh = setInterval(() => {
      setUrlKey((key) => key + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(refresh);
  }, [wfo]);
  return (
    <div>
      {wfo && supportsStatic && viewStatic && (
        <div onClick={() => setViewStatis(false)}>
          <AspectRatio ratio={1}>
            <img
              style={imgStyle}
              onError={() => setSupportsStatic(false)}
              onLoad={() => setLoading(false)}
              alt={"clouds"}
              crossOrigin="anonymous"
              src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/600x600.jpg?${urlKey}`}
            />
          </AspectRatio>
        </div>
      )}
      {wfo && supportsGOES18 && !viewStatic && (
        <div onClick={() => setViewStatis(true)}>
          <AspectRatio ratio={1}>
            <img
              style={imgStyle}
              onError={() => setSupportsGOES18(false)}
              onLoad={() => setLoading(false)}
              alt={"clouds"}
              crossOrigin="anonymous"
              src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES18-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
            />
          </AspectRatio>
        </div>
      )}
      {wfo && supportsGOES16 && !viewStatic && (
        <div onClick={() => setViewStatis(true)}>
          <AspectRatio ratio={1}>
            <img
              style={imgStyle}
              onError={() => setSupportsGOES16(false)}
              onLoad={() => setLoading(false)}
              alt={"clouds"}
              crossOrigin="anonymous"
              src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES16-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
            />
          </AspectRatio>
        </div>
      )}
    </div>
  );
}

function LiveWeatherCard({ wfo }) {
  return (
    <Card sx={{ p: 0, gap: 0 }}>
      <Box sx={{ mb: 2, pt: 2, px: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Live Clouds</Typography>
        </Stack>
      </Box>
      <Divider sx={{ mb: 0 }} />
      <Box
        sx={{
          border: "3px solid",
          borderColor: "divider",
          borderRadius: "0.2rem",
        }}
      >
        <GOESImage wfo={wfo} />
      </Box>
    </Card>
  );
}

export default function LocationWeatherPage() {
  const { location } = useBackend();
  const { wfo } = useWFO(location);
  return (
    <BaseLocationPage tabIdx={0}>
      {wfo && <LiveWeatherCard wfo={wfo} />}
      <WeekForecastCard location={location} />
    </BaseLocationPage>
  );
}
