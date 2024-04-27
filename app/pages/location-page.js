"use client";

import React, { useEffect, useState } from "react";
import { Card, Flex, Text, Grid, Title, Tracker, Badge } from "@tremor/react";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";
import BadgeIconRound from "../components/badge-icon-round";
import { CloudIcon } from "@heroicons/react/24/solid";
import { formatTime, formatLocation } from "../utils";
import { useCallWithCache } from "../python";

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

const useWeather = () => {
  const [forecast, setForecast] = useState(null);
  const { location } = useAPI();
  useEffect(() => {
    async function fetchWeather() {
      const weatherResp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=precipitation_probability,cloud_cover,visibility&daily=weather_code&timezone=${location.timezone}`
      );
      const weather = await weatherResp.json();
      if (!weather.error) {
        setForecast(weather);
      } else {
        alert("Weather: " + weather.reason);
      }
    }
    if (location) {
      fetchWeather();
    }
  }, [location]);

  const { result: weatherResult, ready: weatherReady } = useCallWithCache(
    "get_week_info_with_weather_data",
    "weather",
    forecast &&
      location && {
        weather_data: forecast,
        lat: location?.lat,
        lon: location?.lon,
        timezone: location?.timezone,
        elevation: location?.elevation,
      }
  );

  return [weatherReady, weatherResult];
};

function GOESCard({ wfo }) {
  const [urlKey, setUrlKey] = useState(0);
  const [loading, setLoading] = useState(true);
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
      {loading && (
        <img src="/600.png" alt="Placeholder" width="600" height="600"></img>
      )}
      {wfo && supportsStatic && viewStatic && (
        <Flex onClick={() => setViewStatis(false)}>
          <img
            style={{ display: loading ? "none" : "block" }}
            onError={() => setSupportsStatic(false)}
            onLoad={() => setLoading(false)}
            alt={"image of clouds"}
            crossorigin="anonymous"
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/600x600.jpg?${urlKey}`}
          />
        </Flex>
      )}
      {wfo && supportsGOES18 && !viewStatic && (
        <Flex onClick={() => setViewStatis(true)}>
          <img
            style={{ display: loading ? "none" : "block" }}
            onError={() => setSupportsGOES18(false)}
            onLoad={() => setLoading(false)}
            alt={"image of clouds"}
            crossorigin="anonymous"
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES18-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
          />
        </Flex>
      )}
      {wfo && supportsGOES16 && !viewStatic && (
        <Flex onClick={() => setViewStatis(true)}>
          <img
            style={{ display: loading ? "none" : "block" }}
            onError={() => setSupportsGOES16(false)}
            onLoad={() => setLoading(false)}
            alt={"image of clouds"}
            crossorigin="anonymous"
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

function visabilityToColor(visability) {
  if (visability < 4000) {
    return "red";
  } else if (visability < 10000) {
    return "yellow";
  } else {
    return "green";
  }
}

function moonIlluminationToColor(moonIllumination) {
  if (moonIllumination < 30) {
    return "gray-600";
  } else if (moonIllumination < 40) {
    return "gray-500";
  } else if (moonIllumination < 50) {
    return "gray-400";
  } else if (moonIllumination < 60) {
    return "gray-300";
  } else if (moonIllumination < 70) {
    return "gray-200";
  } else {
    return "gray-100";
  }
}

function WeatherCard({ dateInfo, timezone }) {
  const timeAtIndex = (i) => formatTime(dateInfo.time[i], timezone);
  const now = +Date.now();
  const nowIndex = dateInfo.time.findIndex((x) => x > now) || 0;
  const skyData = [];
  for (let i in dateInfo.time) {
    if (i < nowIndex - 1) {
      continue;
    }
    skyData.push({
      tooltip: `${getTwlightName(dateInfo.twilight_state[i])} at ${timeAtIndex(
        i
      )}`,
      color: twilightToColor(dateInfo.twilight_state[i]),
    });
  }
  const cloudData = [];
  if (dateInfo.cloud_cover) {
    for (let i in dateInfo.time) {
      if (i < nowIndex - 1) {
        continue;
      }
      cloudData.push({
        tooltip: `${dateInfo.cloud_cover[i]}% at ${timeAtIndex(i)}`,
        color: cloudCoverToColor(dateInfo.cloud_cover[i]),
      });
    }
  }
  const precipitationData = [];
  if (dateInfo.precipitation_probability) {
    for (let i in dateInfo.time) {
      if (i < nowIndex - 1) {
        continue;
      }
      precipitationData.push({
        tooltip: `${dateInfo.precipitation_probability[i]}% at ${timeAtIndex(
          i
        )}`,
        color: precipitationToColor(dateInfo.precipitation_probability[i]),
      });
    }
  }
  const visabilityData = [];
  if (dateInfo.visibility) {
    for (let i in dateInfo.time) {
      if (i < nowIndex - 1) {
        continue;
      }
      visabilityData.push({
        tooltip: `${dateInfo.visibility[i]} km at ${timeAtIndex(i)}`,
        color: visabilityToColor(dateInfo.visibility[i]),
      });
    }
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
        <Badge
          className="moon-badge"
          color={moonIlluminationToColor(dateInfo.moon_illumination)}
        >
          {Math.round(dateInfo.moon_illumination)}% Moon
        </Badge>
      </Flex>
      <div>
        <Text color="slate-400">Sky</Text>
        <Tracker data={skyData} className="mt-2 mb-2" />
      </div>
      <div>
        <Text color="slate-400">Clouds</Text>
        <Tracker data={cloudData} className="mt-2 mb-2" />
      </div>
      <div>
        <Text color="slate-400">Precipitation</Text>
        <Tracker data={precipitationData} className="mt-2  mb-2" />
      </div>
      <div>
        <Text color="slate-400">Visability</Text>
        <Tracker data={visabilityData} className="mt-2" />
      </div>
    </Card>
  );
}

export default function LocationPage() {
  const { ready, location } = useAPI();
  const wfo = useWFO(location?.lat, location?.lon);
  const [weatherReady, weather] = useWeather();

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Location"
        subtitle={location ? formatLocation(location.lat, location.lon) : ""}
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
          location &&
          Object.values(weather)
            .filter((x) => !!x)
            .map((dateInfo, dayIdx) => {
              return (
                <WeatherCard
                  key={dayIdx}
                  dateInfo={dateInfo}
                  timezone={location.timezone}
                />
              );
            })}
      </Grid>
    </div>
  );
}
