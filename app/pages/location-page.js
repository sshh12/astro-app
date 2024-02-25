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
  const [weatherReady, setWeatherReady] = useState(false);
  const { post } = useAPI();
  const key = "astro-app:location_details";
  useEffect(() => {
    setWeather(JSON.parse(localStorage.getItem(key)) || null);
    async function fetchWeather() {
      const weatherResp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,cloud_cover&daily=weather_code&timezone=${timezone}`
      );
      const weatherData = await weatherResp.json();
      const apiResult = await post("get_location_details", {
        weather_data: weatherData,
      });
      setWeather(apiResult);
      setWeatherReady(true);
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (lat && lon && timezone) {
      fetchWeather();
    }
  }, [lat, lon, timezone]);
  return [weatherReady, weather];
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
  const [viewStatic, setViewStatis] = useState(true);
  const [supportsStatic, setSupportsStatic] = useState(true);
  const [supportsGOES18, setSupportsGOES18] = useState(true);
  const [supportsGOES16, setSupportsGOES16] = useState(true);
  useEffect(() => {
    const refresh = setInterval(() => {
      setUrlKey((key) => key + 1);
    }, 5 * 60 * 1000);
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
      {wfo && supportsStatic && viewStatic && (
        <Flex onClick={() => setViewStatis(false)}>
          <img
            onError={() => setSupportsStatic(false)}
            alt={"image of clouds"}
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/600x600.jpg?${urlKey}`}
          />
        </Flex>
      )}
      {wfo && supportsGOES18 && !viewStatic && (
        <Flex onClick={() => setViewStatis(true)}>
          <img
            onError={() => setSupportsGOES18(false)}
            alt={"image of clouds"}
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES18-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
          />
        </Flex>
      )}
      {wfo && supportsGOES16 && !viewStatic && (
        <Flex onClick={() => setViewStatis(true)}>
          <img
            onError={() => setSupportsGOES16(false)}
            alt={"image of clouds"}
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES16-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
          />
        </Flex>
      )}
    </Card>
  );
}

function getTwlightName(value) {
  return {
    0: "Night",
    1: "Astronomical twilight",
    2: "Nautical twilight",
    3: "Civil twilight",
    4: "Day",
  }[value];
}

function twilightToColor(value) {
  if (value === 4) {
    return "yellow";
  } else if (value === 3) {
    return "orange";
  } else if (value === 2) {
    return "gray-600";
  } else {
    return "gray-950";
  }
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
    return "green";
  } else if (precipitation < 50) {
    return "yellow";
  } else {
    return "red";
  }
}

function moonIlluminationToColor(moonIllumination) {
  if (moonIllumination < 10) {
    return "gray-800";
  } else if (moonIllumination < 20) {
    return "gray-700";
  } else if (moonIllumination < 30) {
    return "gray-600";
  } else if (moonIllumination < 40) {
    return "gray-500";
  } else if (moonIllumination < 50) {
    return "gray-400";
  } else if (moonIllumination < 60) {
    return "gray-300";
  } else if (moonIllumination < 70) {
    return "gray-200";
  } else if (moonIllumination < 80) {
    return "gray-100";
  } else {
    return "gray-100";
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

function WeatherCard({ dateInfo, timezone }) {
  const timeAtIndex = (i) => formatTime(dateInfo.time[i], timezone);
  const skyData = [];
  for (let i in dateInfo.time) {
    skyData.push({
      tooltip: `${getTwlightName(dateInfo.twilight_state[i])} at ${timeAtIndex(
        i
      )}`,
      color: twilightToColor(dateInfo.twilight_state[i]),
    });
  }
  const cloudData = [];
  for (let i in dateInfo.time) {
    cloudData.push({
      tooltip: `${dateInfo.cloud_cover[i]}% at ${timeAtIndex(i)}`,
      color: cloudCoverToColor(dateInfo.cloud_cover[i]),
    });
  }
  const precipitationData = [];
  for (let i in dateInfo.time) {
    precipitationData.push({
      tooltip: `${dateInfo.precipitation_probability[i]}% at ${timeAtIndex(i)}`,
      color: precipitationToColor(dateInfo.precipitation_probability[i]),
    });
  }
  return (
    <Card>
      <Flex alignItems="start" className="mb-3">
        <div className="truncate">
          <Text color="white">
            {dateInfo.start_weekday} - {dateInfo.end_weekday}
          </Text>
        </div>
      </Flex>
      <Flex className="mb-3">
        <Badge color={weatherCodeToColor(dateInfo.weather_code)}>
          {WEATHER_CODES[dateInfo.weather_code]}
        </Badge>
        <Badge color={moonIlluminationToColor(dateInfo.moon_illumination)}>
          {Math.round(dateInfo.moon_illumination)}% Moon
        </Badge>
      </Flex>
      <div>
        <Text color="gray-500">Sky</Text>
        <Tracker data={skyData} className="mt-2 mb-2" />
      </div>
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
  const [weatherReady, weather] = useWeather(
    user?.lat,
    user?.lon,
    user?.timezone
  );

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Location"
        subtitle={user ? formatLocation(user.lat, user.lon) : ""}
        loading={!ready || !weatherReady}
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
          user &&
          weather.location_details.map((dateInfo, dayIdx) => {
            return (
              <WeatherCard
                key={dayIdx}
                dateInfo={dateInfo}
                timezone={user.timezone}
              />
            );
          })}
      </Grid>
    </div>
  );
}
