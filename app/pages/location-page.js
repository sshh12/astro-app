"use client";

import React, { useEffect, useState } from "react";
import { Card, Flex, Text, Grid } from "@tremor/react";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";
import BadgeIconRound from "../components/badge-icon-round";
import { CloudIcon } from "@heroicons/react/24/solid";

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
  const [useGOES18, setUseGOES18] = useState(false);
  useEffect(() => {
    const refresh = setInterval(() => {
      setUrlKey((key) => key + 1);
    }, 10 * 1000);
    setUseGOES18(false);
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
      {wfo && useGOES18 && (
        <Flex>
          <img
            onError={() => setUseGOES18(false)}
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES18-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
          />
        </Flex>
      )}
      {wfo && !useGOES18 && (
        <Flex>
          <img
            onError={() => setUseGOES18(true)}
            src={`https://cdn.star.nesdis.noaa.gov/WFO/${wfo.toLowerCase()}/DayNightCloudMicroCombo/GOES16-${wfo.toUpperCase()}-DayNightCloudMicroCombo-600x600.gif?${urlKey}`}
          />
        </Flex>
      )}
    </Card>
  );
}

export default function LocationPage() {
  const { ready, user } = useAPI();
  const wfo = useWFO(user?.lat, user?.lon);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Location"
        subtitle={user ? formatLocation(user.lat, user.lon) : ""}
        loading={!ready}
      />

      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        <GOESCard wfo={wfo} />
      </Grid>
    </div>
  );
}
