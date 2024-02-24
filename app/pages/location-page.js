"use client";

import React, { useEffect, useState } from "react";
import { Card, Flex, Text, Grid, Title, Tracker, Badge } from "@tremor/react";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";
import BadgeIconRound from "../components/badge-icon-round";
import { CloudIcon } from "@heroicons/react/24/solid";
import { formatTime } from "../utils";

function useWFO(lat, lon) {
  const [wfo, setWFO] = useState(null);
  useEffect(() => {
    async function fetchWFO() {
      const response = await fetch(
        `https://api.weather.gov/points/${lat},${lon}`
      );
      const data = await response.json();
      const wfo = data.properties.cwa;
      setWFO(wfo);
    }
    if (lat && lon) {
      fetchWFO();
    }
  }, [lat, lon]);
  return wfo;
}

const useWeather = (lat, lon, timezone) => {
  const [weather, setWeather] = useState(null);
  const key = "astro-app:weather";
  useEffect(() => {
    setWeather(JSON.parse(localStorage.getItem(key)) || null);
    async function fetchWeather() {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,cloud_cover&daily=weather_code,sunrise,sunset,precipitation_probability_max&timezone=${timezone}`
      );
      const data = await response.json();
      setWeather(data);
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (lat && lon && timezone) {
      fetchWeather();
    }
  }, [lat, lon]);
  return weather;
};

function formatLocation(lat, lon) {
  let latFormat = lat.toFixed(2);
  if (lat < 0) {
    latFormat = (-latFormat).toFixed(2) + " S";
  } else {
    latFormat += " N";
  }
  let lonFormat = lon.toFixed(2);
  if (lon < 0) {
    lonFormat = (-lonFormat).toFixed(2) + " W";
  } else {
    lonFormat += " E";
  }
  return `${latFormat}, ${lonFormat}`;
}

function GOESCard({ wfo }) {
  const [urlKey, setUrlKey] = useState(0);
  useEffect(() => {
    const refresh = setInterval(() => {
      setUrlKey((key) => key + 1);
    }, 10 * 1000);
    return () => clearInterval(refresh);
  }, [wfo]);
  return (
    <Card onClick={() => void 0}>
      <Flex alignItems="start" className="mb-3">
        <div className="truncate">
          <Text color="white">Live Clouds</Text>
        </div>
        <BadgeIconRound icon={CloudIcon} color={"green"} />
      </Flex>
      {wfo && (
        <Flex>
          <img
            onError={() => setUseGOES18(false)}
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/600x600.jpg?${urlKey}`}
          />
        </Flex>
      )}
    </Card>
  );
}

function getDayOfWeek(dateString) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
}

function cloudCoverToColor(cloudCover) {
  if (cloudCover < 20) {
    return "green";
  } else if (cloudCover < 80) {
    return "yellow";
  } else {
    return "red";
  }
}

function precipitationToColor(precipitation) {
  if (precipitation < 20) {
    return "gray";
  } else {
    return "blue";
  }
}

const WEATHER_CODES = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  56: "Freezing Drizzle",
  57: "Freezing Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Rain",
  66: "Freezing Rain",
  67: "Freezing Rain",
  71: "Snow",
  73: "Snow",
  75: "Snow",
  77: "Snow",
  80: "Rain",
  81: "Rain",
  82: "Rain",
  85: "Snow",
  86: "Snow",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

function weatherCodeToColor(weatherCode) {
  if (weatherCode < 3) {
    return "green";
  } else if (weatherCode < 45) {
    return "yellow";
  } else if (weatherCode < 80) {
    return "orange";
  } else {
    return "red";
  }
}

function WeatherCard({
  timezone,
  date,
  hours,
  hourlyCloudCover,
  hourlyPrecipitation,
  weatherCode,
}) {
  const timeAtIndex = (i) => formatTime(hours[i], timezone);
  const cloudData = [];
  for (let i in hours) {
    cloudData.push({
      tooltip: `${hourlyCloudCover[i]}% at ${timeAtIndex(i)}`,
      color: cloudCoverToColor(hourlyCloudCover[i]),
    });
  }
  const precipitationData = [];
  for (let i in hours) {
    precipitationData.push({
      tooltip: `${hourlyPrecipitation[i]}% at ${timeAtIndex(i)}`,
      color: precipitationToColor(hourlyPrecipitation[i]),
    });
  }
  return (
    <Card>
      <Flex alignItems="start" className="mb-3">
        <div className="truncate">
          <Text color="white">{getDayOfWeek(date)}</Text>
        </div>
        <Badge color={weatherCodeToColor(weatherCode)}>
          {WEATHER_CODES[weatherCode]}
        </Badge>
      </Flex>
      <div>
        <Text color="gray-500">Clouds</Text>
        <Tracker data={cloudData} className="mt-2 mb-2" />
      </div>
      <div>
        <Text color="gray-500">Precipitation</Text>
        <Tracker data={precipitationData} className="mt-2" />
      </div>
    </Card>
  );
}

export default function LocationPage() {
  const { ready, user } = useAPI();
  const wfo = useWFO(user?.lat, user?.lon);
  const weather = useWeather(user?.lat, user?.lon, user?.timezone);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Location"
        subtitle={user ? formatLocation(user.lat, user.lon) : ""}
        loading={!ready}
      />

      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 mb-4 gap-1 ml-2 mr-2">
        <GOESCard wfo={wfo} />
      </Grid>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      <div className="mt-5 ml-2 mr-2">
        <Title>This Week</Title>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        {weather &&
          weather.daily.time.map((date, dayIdx) => {
            const hourlyIdxs = weather.hourly.time
              .filter((hour) => hour.startsWith(date))
              .map((hour) => weather.hourly.time.indexOf(hour));
            const hours = hourlyIdxs.map((idx) => weather.hourly.time[idx]);
            const hourlyCloudCover = hourlyIdxs.map(
              (idx) => weather.hourly.cloud_cover[idx]
            );
            const hourlyPrecipitation = hourlyIdxs.map(
              (idx) => weather.hourly.precipitation_probability[idx]
            );
            return (
              <WeatherCard
                key={dayIdx}
                timezone={user.timezone}
                date={date}
                weatherCode={weather.daily.weather_code[dayIdx]}
                hours={hours}
                hourlyCloudCover={hourlyCloudCover}
                hourlyPrecipitation={hourlyPrecipitation}
              />
            );
          })}
      </Grid>
    </div>
  );
}
