import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Box,
  Card,
  Divider,
  ListDivider,
  Stack,
  Chip,
  Dropdown,
  MenuButton,
  IconButton,
  MenuItem,
  Menu,
  Button,
  CardOverflow,
  CardActions,
  Skeleton,
} from "@mui/joy";
import { useBackend } from "../providers/backend";
import BaseLocationPage from "../components/BaseLocationPage";
import { ColorTabs } from "../components/ColorTabs";
import { useCachedPythonOutput } from "../providers/python";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import {
  twilightToColor,
  getTwlightName,
  cloudCoverToBadge,
  precipitationToBadge,
  visibilityToBadge,
  moonPctToIcon,
  summaryToBadge,
} from "../utils/weather";
import {
  renderTime,
  idxContains,
  useCurrentObservingWindow,
} from "./../utils/date";
import { Link } from "react-router-dom";
import { useTimestamp } from "./../utils/date";

function useWeather(location) {
  const [meteoData, setMeteoData] = useState(null);
  useEffect(() => {
    if (location) {
      (async () => {
        const meteoResp = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=precipitation_probability,cloud_cover,visibility&daily=weather_code&timezone=${location.timezone}`
        );
        const meteoData = await meteoResp.json();
        if (!meteoData.error) {
          setMeteoData(meteoData);
        } else {
          alert("Weather: " + meteoData.reason);
        }
      })();
    }
  }, [location]);

  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);
  const { ts } = useTimestamp();
  const tsNowRoundedToHour = Math.floor(ts / 3600000) * 3600000;

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
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Forecast</Typography>
          <ForecastOptions />
        </Stack>
        <Typography level="body-sm">When to expect clear skies.</Typography>
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

export default function LocationWeatherPage() {
  const { location } = useBackend();
  return (
    <BaseLocationPage tabIdx={0}>
      <WeekForecastCard location={location} />
    </BaseLocationPage>
  );
}
