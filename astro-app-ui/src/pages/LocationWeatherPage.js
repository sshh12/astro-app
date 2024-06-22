import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  Divider,
  ListDivider,
  Stack,
  Chip,
} from "@mui/joy";
import { useBackend } from "../providers/backend";
import BaseLocationPage from "../components/BaseLocationPage";
import { ColorTabs } from "../components/ColorTabs";
import { useCachedPythonOutput } from "../providers/python";
import {
  twilightToColor,
  getTwlightName,
  cloudCoverToColor,
  precipitationToColor,
  visabilityToColor,
  moonPctToIcon,
} from "../utils/weather";
import { renderTime } from "./../utils/date";

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

  const { result: weather, stale } = useCachedPythonOutput(
    "get_week_info_with_weather_data",
    meteoData &&
      location && {
        weather_data: meteoData,
        lat: location?.lat,
        lon: location?.lon,
        timezone: location?.timezone,
        elevation: location?.elevation,
      },
    { cacheKey: `${location?.id}_weather`, staleCacheKey: `weather` }
  );

  return { weather, stale };
}

function ForecastDay({ dateInfo }) {
  const idxs = [...Array(dateInfo.time.length).keys()];
  const skyTabs = idxs.map((i) => ({
    tooltip: `${getTwlightName(dateInfo.twilight_state[i])} at ${renderTime(
      dateInfo.time[i]
    )}`,
    color: twilightToColor(dateInfo.twilight_state[i]),
  }));
  const cloudTabs = idxs.map((i) => ({
    tooltip: `${dateInfo.cloud_cover[i]}% at ${renderTime(dateInfo.time[i])}`,
    color: cloudCoverToColor(dateInfo.cloud_cover[i]),
  }));
  const precTabs = idxs.map((i) => ({
    tooltip: `${dateInfo.precipitation_probability[i]}% at ${renderTime(
      dateInfo.time[i]
    )}`,
    color: precipitationToColor(dateInfo.precipitation_probability[i]),
  }));
  const visTabs = idxs.map((i) => ({
    tooltip: `${dateInfo.visibility[i]} km at ${renderTime(dateInfo.time[i])}`,
    color: visabilityToColor(dateInfo.visibility[i]),
  }));
  const MoonIcon = moonPctToIcon(dateInfo.moon_illumination);
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between" }}>
        <Typography level="title-md">
          {dateInfo.start_weekday} - {dateInfo.end_weekday}
        </Typography>
        <Chip variant="solid" startDecorator={<MoonIcon />}>
          {Math.round(dateInfo.moon_illumination)}%
        </Chip>
      </Stack>
      <Stack spacing={2}>
        <ColorTabs tabs={skyTabs} />
        <ColorTabs tabs={cloudTabs} />
        <ColorTabs tabs={precTabs} />
        <ColorTabs tabs={visTabs} />
      </Stack>
    </Box>
  );
}

function WeekForecastCard({ location }) {
  const { weather } = useWeather(location);
  console.log("weather", weather);
  if (!weather) {
    return <></>;
  }
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">Forecast</Typography>
        <Typography level="body-sm">When to expect clear skies.</Typography>
      </Box>
      <Divider />
      {weather.map((dateInfo, idx) => (
        <>
          <ForecastDay dateInfo={dateInfo} />
          {idx < weather.length - 1 && <ListDivider />}
        </>
      ))}
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
