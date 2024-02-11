"use client";

import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  ArrowUturnLeftIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";
import { Card, Flex, Text, List, ListItem, Grid } from "@tremor/react";
import { useNav } from "../nav";
import SkyChart from "../components/sky-chart";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";
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
  const { user, post, ready } = useAPI();
  const [object, setObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openListDialog, setOpenListDialog] = useState(false);

  useEffect(() => {
    if (pageParams.id) {
      post("get_space_object", { id: pageParams.id }).then((object) => {
        setObject(object);
        setLoading(false);
      });
    }
  }, [pageParams.id, post]);

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
        loading={loading || !ready}
      />

      {object && (
        <ListDialog
          object={object}
          open={openListDialog}
          setOpen={setOpenListDialog}
        />
      )}

      <div className="pb-6">
        {object && (
          <SkyChart
            className="mt-6"
            times={object.orbits.time}
            timeStates={object.orbits.time_state}
            timezone={object.orbits.timezone}
            objects={[
              {
                alt: object.orbits.objects[object.id].alt,
                name: object.name,
                color: "green",
              },
            ]}
          />
        )}
        {!object && (
          <SkyChart className="mt-6" times={[]} timeStates={[]} objects={[]} />
        )}
      </div>

      {object && (
        <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
          <NameCard object={object} />
        </Grid>
      )}
    </div>
  );
}
