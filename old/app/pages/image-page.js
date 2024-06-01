"use client";

import React from "react";
import { Card, Flex, Text, List, ListItem, Grid } from "@tremor/react";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";
import { equipmentToDimensions } from "../utils";

function EquipmentCard({ equipment }) {
  const { title, details } = equipmentToDimensions(equipment);
  return (
    <Card>
      <Flex alignItems="start">
        <div className="truncate">
          <Text color="white">Equipment Details</Text>
        </div>
      </Flex>
      <Flex className="mt-2">
        <Text>{title}</Text>
      </Flex>
      <Flex className="mt-2">
        <List>
          {details.map((detail) => (
            <ListItem key={detail.name}>
              <Text color="slate-400">{detail.name}</Text>
              <Text color="slate-400">{detail.value}</Text>
            </ListItem>
          ))}
        </List>
      </Flex>
    </Card>
  );
}

export default function ImagePage() {
  const { ready, equipment } = useAPI();
  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title={"Image"}
        subtitle={""}
        rightIcons={[]}
        loading={!ready}
      />

      <Grid numItemsMd={1} numItemsLg={1} className="mt-3 gap-1 ml-2 mr-2">
        {equipment && <EquipmentCard equipment={equipment} />}
      </Grid>
    </div>
  );
}
