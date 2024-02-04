"use client";

import React from "react";
import { Card, Flex, Grid, Text } from "@tremor/react";
import {
  UserPlusIcon,
  MapPinIcon,
  UserCircleIcon,
  FlagIcon,
} from "@heroicons/react/24/solid";
import BadgeIconRound from "../components/badge-icon-round";
import StickyHeader from "../components/sticky-header";

export default function ProfilePage() {
  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Profile"
        subtitle="@sshh12"
        rightIcon={UserPlusIcon}
      />

      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        <Card>
          <Flex alignItems="start">
            <div className="truncate">
              <Text color="white">Account</Text>
            </div>
            <BadgeIconRound icon={UserCircleIcon} color={"orange"} />
          </Flex>
          <Flex className="mt-4 space-x-2">
            <div>
              <Text className="truncate">@sshh12</Text>
              <Text className="truncate">********</Text>
            </div>
          </Flex>
        </Card>
        <Card>
          <Flex alignItems="start">
            <div className="truncate">
              <Text color="white">Location</Text>
            </div>
            <BadgeIconRound icon={MapPinIcon} color={"blue"} />
          </Flex>
          <Flex className="mt-4 space-x-2">
            <div>
              <Text className="truncate">LAT 37.7762735</Text>
              <Text className="truncate">LNG -122.4332375</Text>
              <Text className="truncate">TZ US/Eastern</Text>
            </div>
          </Flex>
        </Card>
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
