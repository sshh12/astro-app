"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Flex,
  Text,
  TabGroup,
  TabPanel,
  TabPanels,
  TabList,
  Tab,
} from "@tremor/react";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";
import BadgeIconRound from "../components/badge-icon-round";
import { CloudIcon } from "@heroicons/react/24/solid";
import { formatLocation } from "../utils";
import { useCallWithCache } from "../python";
import LocationForecast from "../components/location-forecast";
import LocationLightPollution from "../components/location-light";

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

function GOESImage({ wfo }) {
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
    <div>
      {loading && (
        <img src="/600.png" alt="Placeholder" width="600" height="600"></img>
      )}
      {wfo && supportsStatic && viewStatic && (
        <div
          onClick={() => setViewStatis(false)}
          className="flex justify-center"
        >
          <img
            style={{ display: loading ? "none" : "block" }}
            onError={() => setSupportsStatic(false)}
            onLoad={() => setLoading(false)}
            alt={"image of clouds"}
            crossorigin="anonymous"
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/600x600.jpg?${urlKey}`}
          />
        </div>
      )}
      {wfo && supportsGOES18 && !viewStatic && (
        <div
          onClick={() => setViewStatis(true)}
          className="flex justify-center"
        >
          <img
            style={{ display: loading ? "none" : "block" }}
            onError={() => setSupportsGOES18(false)}
            onLoad={() => setLoading(false)}
            alt={"image of clouds"}
            crossorigin="anonymous"
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES18-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
          />
        </div>
      )}
      {wfo && supportsGOES16 && !viewStatic && (
        <div
          onClick={() => setViewStatis(true)}
          className="flex justify-center"
        >
          <img
            style={{ display: loading ? "none" : "block" }}
            onError={() => setSupportsGOES16(false)}
            onLoad={() => setLoading(false)}
            alt={"image of clouds"}
            crossorigin="anonymous"
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES16-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
          />
        </div>
      )}
    </div>
  );
}

function LiveWeatherCard({ wfo }) {
  return (
    <Card>
      <Flex alignItems="start" className="mb-3">
        <div className="truncate">
          <Text color="white">Live Weather</Text>
        </div>
        <BadgeIconRound icon={CloudIcon} color={"green"} />
      </Flex>
      <GOESImage wfo={wfo} />
    </Card>
  );
}

const LOCATION_TABS = [
  { label: "Forecast", render: LocationForecast },
  { label: "Light Pollution", render: LocationLightPollution },
];

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

      <div className="mt-3 ml-2 mr-2 mb-4">
        <LiveWeatherCard wfo={wfo} />
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      <TabGroup defaultIndex={1}>
        <TabList
          className="flex w-full tabs-bottom justify-center"
          style={{ padding: 0, height: "3rem" }}
        >
          {LOCATION_TABS.map((tab) => (
            <Tab key={tab.label} style={{ height: "3rem" }}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {LOCATION_TABS.map((tab) => (
            <TabPanel key={tab.label}>{tab.render({ weather })}</TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
