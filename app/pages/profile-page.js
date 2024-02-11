"use client";

import React from "react";
import { Card, Flex, Grid, Text } from "@tremor/react";
import {
  MapPinIcon,
  UserCircleIcon,
  FlagIcon,
} from "@heroicons/react/24/solid";
import BadgeIconRound from "../components/badge-icon-round";
import StickyHeader from "../components/sticky-header";
import SettingsCard from "../components/settings-card";
import { useAPI } from "../api";

export default function ProfilePage() {
  const { ready, user } = useAPI();
  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Profile"
        subtitle={ready ? "@" + user.name : ""}
        loading={!ready}
      />

      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        <SettingsCard
          title="Account"
          icon={UserCircleIcon}
          color="orange"
          items={[{ name: "USERNAME", value: user?.name }]}
        />
        <SettingsCard
          title="Location"
          icon={MapPinIcon}
          color="blue"
          items={[
            { name: "LATITUDE", value: user?.lat },
            { name: "LONGITUDE", value: user?.lon },
            { name: "ELEVATION (m)", value: user?.elevation },
            { name: "TIMEZONE", value: user?.timezone },
          ]}
        />
        <Card>
          <Flex alignItems="start">
            <div className="truncate">
              <Text color="white">Feedback</Text>
            </div>
            <BadgeIconRound icon={FlagIcon} color={"purple"} />
          </Flex>
          <Flex className="mt-4 space-x-2">
            <div>
              <Text className="truncate">
                Share feedback or submit a feature request.
              </Text>
            </div>
          </Flex>
        </Card>
      </Grid>
    </div>
  );
}
