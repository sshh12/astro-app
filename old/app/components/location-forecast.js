"use client";

import React from "react";
import { Card, Flex, Text, Grid, Tracker, Badge } from "@tremor/react";
import { useAPI } from "../api";
import { formatTime } from "../utils";

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

function cloudCoverToBadge(cloudCover) {
  if (cloudCover < 20) {
    return "green";
  } else if (cloudCover < 80) {
    return "yellow";
  } else {
    return "red";
  }
}

function precipitationToBadge(precipitation) {
  if (precipitation < 20) {
    return "green";
  } else if (precipitation < 50) {
    return "yellow";
  } else {
    return "red";
  }
}

function visibilityToBadge(visibility) {
  if (visibility < 4000) {
    return "red";
  } else if (visibility < 10000) {
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
        color: cloudCoverToBadge(dateInfo.cloud_cover[i]),
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
        color: precipitationToBadge(dateInfo.precipitation_probability[i]),
      });
    }
  }
  const visibilityData = [];
  if (dateInfo.visibility) {
    for (let i in dateInfo.time) {
      if (i < nowIndex - 1) {
        continue;
      }
      visibilityData.push({
        tooltip: `${dateInfo.visibility[i]} km at ${timeAtIndex(i)}`,
        color: visibilityToBadge(dateInfo.visibility[i]),
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
        <Tracker data={visibilityData} className="mt-2" />
      </div>
    </Card>
  );
}

export default function LocationForecast({ weather }) {
  const { location } = useAPI();
  return (
    <div>
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
