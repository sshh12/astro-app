"use client";

import React from "react";
import { Card, Flex, Text, Grid, Tracker, Badge } from "@tremor/react";
import { useAPI } from "../api";
import { formatTime } from "../utils";

export default function LocationLightPollution({ weather }) {
  const { location } = useAPI();
  return <div>Hi</div>;
}
