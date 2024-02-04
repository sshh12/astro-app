"use client";

import React from "react";
import {
  BadgeDelta,
  Card,
  Flex,
  Grid,
  Text,
  Title,
  Select,
  SelectItem,
} from "@tremor/react";
import {
  AdjustmentsVerticalIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import StickyHeader from "../components/sticky-header";
import BadgeIconRound from "../components/badge-icon-round";

const skyData = [
  {
    title: "M81",
    delta: "14°",
    deltaType: "moderateIncrease",
  },
  {
    title: "M33",
    delta: "23°",
    deltaType: "increase",
  },
  {
    title: "M86",
    delta: "-10°",
    deltaType: "moderateDecrease",
  },
  {
    title: "M91",
    delta: "5°",
    deltaType: "unchanged",
  },
];

export default function SearchPage() {
  const { setPage } = useNav();

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title=""
        subtitle={""}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => setPage("/sky")}
        search={true}
      />

      <Card className="rounded-none" style={{ borderRadius: "0" }}>
        <Flex alignItems="start">
          <div className="truncate">
            <Text color="white">Filters</Text>
          </div>
          <BadgeIconRound icon={AdjustmentsVerticalIcon} />
        </Flex>
        <div className="max-w-sm mx-auto space-y-6 mt-3">
          <Select placeholder={"Object Type"}>
            <SelectItem value="1">Kilometers</SelectItem>
            <SelectItem value="2">Meters</SelectItem>
            <SelectItem value="3">Miles</SelectItem>
            <SelectItem value="4">Nautical Miles</SelectItem>
          </Select>
          <Select placeholder={"Constellation"}>
            <SelectItem value="1">Kilometers</SelectItem>
            <SelectItem value="2">Meters</SelectItem>
            <SelectItem value="3">Miles</SelectItem>
            <SelectItem value="4">Nautical Miles</SelectItem>
          </Select>
        </div>
      </Card>

      <div className="mt-5 ml-2 mr-2">
        <Title>Results</Title>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        {skyData.concat(skyData).map((item) => (
          <Card key={item.title}>
            <Flex alignItems="start">
              <div className="truncate">
                <Text color="white">{item.title}</Text>
              </div>
              <BadgeDelta deltaType={item.deltaType}>{item.delta}</BadgeDelta>
            </Flex>
            <Flex className="mt-4 space-x-2">
              <div>
                <Text className="truncate">RA 07.34.54</Text>
                <Text className="truncate">DEC 12.54.45</Text>
                <Text className="truncate">T+20m</Text>
              </div>
            </Flex>
          </Card>
        ))}
      </Grid>
    </div>
  );
}
