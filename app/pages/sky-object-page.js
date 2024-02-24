"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  ArrowUturnLeftIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";
import { Card, Flex, Text, List, ListItem, Grid } from "@tremor/react";
import { useNav } from "../nav";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import { useAPI, usePostWithCache } from "../api";
import ListDialog from "../components/list-dialog";

function NameCard({ object }) {
  const names = object.names;
  names.sort((a, b) => {
    let aScore = a.length;
    let bScore = b.length;
    if (a.includes("NAME ")) {
      aScore -= 1000;
    }
    if (b.includes("NAME ")) {
      bScore -= 1000;
    }
    return aScore - bScore;
  });
  return (
    <Card>
      <Flex alignItems="start">
        <div className="truncate">
          <Text color="white">Identifiers</Text>
        </div>
      </Flex>
      <List>
        {names.map((objName) => {
          const [key, ...value] = objName.split(" ");
          return (
            <ListItem key={objName}>
              <span>{key}</span>
              <span>{value.join(" ")}</span>
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
}

export default function SkyObjectPage() {
  const { pageParams, setPage } = useNav();
  const { user, ready } = useAPI();
  const [openListDialog, setOpenListDialog] = useState(false);

  const [objectReady, object] = usePostWithCache(
    pageParams.id && "get_space_object",
    {
      id: pageParams.id,
    }
  );

  const isOnList = user?.lists.find((list) =>
    list.objects.find((obj) => obj.id === pageParams.id)
  );

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title={pageParams.name}
        subtitle={""}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => setPage("/sky")}
        rightIcon={isOnList ? ListBulletIcon : PlusIcon}
        rightIconOnClick={() => setOpenListDialog(true)}
        loading={!objectReady || !ready}
      />

      {object && (
        <ListDialog
          object={object}
          open={openListDialog}
          setOpen={setOpenListDialog}
        />
      )}

      <div className="pb-5">
        {object && (
          <SkyChartPanel
            times={object.orbits.time}
            timeStates={object.orbits.time_state}
            timezone={object.orbits.timezone}
            objects={[
              {
                alt: object.orbits.objects[object.id].alt,
                az: object.orbits.objects[object.id].az,
                name: object.name,
                color: object.color,
              },
            ]}
          />
        )}
        {!object && <SkyChartPanel times={[]} timeStates={[]} objects={[]} />}
      </div>

      {object && (
        <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
          {object.name.length > 0 && <NameCard object={object} />}
        </Grid>
      )}
    </div>
  );
}
