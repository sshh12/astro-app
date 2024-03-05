"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  ArrowUturnLeftIcon,
  ListBulletIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import { Card, Flex, Text, List, ListItem, Grid } from "@tremor/react";
import { useNav } from "../nav";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import { useAPI, usePostWithCache } from "../api";
import ListDialog from "../components/list-dialog";
import SkySurveyImage from "../components/sky-survey-image";
import SkyAltChart from "../components/sky-alt-chart";
import ShareLinkDialog from "../components/share-link-dialog";
import { SKY_SURVEYS } from "./../sky-surveys";

const USEFUL_PREFIXES = ["NAME ", "M ", "UGC ", "NGC ", "APG "];

function NameCard({ object }) {
  const names = object.names.filter(
    (name) =>
      name.length > 0 &&
      !name.startsWith("[") &&
      USEFUL_PREFIXES.some((v) => name.startsWith(v))
  );
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
      <List style={{ color: "grey-200" }}>
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

function OverviewCard({ object }) {
  return (
    <Card>
      <Flex alignItems="start">
        <div className="truncate">
          <Text color="white">Overview</Text>
        </div>
      </Flex>
      <Flex className="mt-2">
        <Text>{object.description}</Text>
      </Flex>
      <Flex className="border-solid border-2 border-gray-700 mt-2">
        <img
          style={{ width: "100%" }}
          src={object.imgURL}
          alt="Astro image"
          crossorigin="anonymous"
        />
      </Flex>
      <Flex className="mt-2">
        <List>
          <ListItem>
            <span>{object.descriptionCredit}</span>
          </ListItem>
          <ListItem>
            <span>Image: {object.imgCredit}</span>
          </ListItem>
          <ListItem>
            <span>Sky Surveys: HiPS2FITS</span>
          </ListItem>
        </List>
      </Flex>
    </Card>
  );
}

function SurveyCard({ object }) {
  return (
    <Card>
      <Flex alignItems="start">
        <div className="truncate">
          <Text color="white">Sky Surveys</Text>
        </div>
      </Flex>
      <Grid
        numItems={2}
        numItemsSm={2}
        numItemsMd={3}
        numItemsLg={3}
        className="mt-3 gap-1 ml-2 mr-2"
      >
        {SKY_SURVEYS.map((survey) => (
          <Flex className="flex-col" key={survey.hips}>
            <Text>{survey.name}</Text>
            <Flex className="border-solid border-2 border-gray-700">
              <SkySurveyImage
                object={object}
                hips={survey.hips}
                fov={1.0}
                aspectRatio={1.0}
              />
            </Flex>
          </Flex>
        ))}
      </Grid>
    </Card>
  );
}

function DetailsCard({ details, detailsReady, timezone }) {
  return (
    <Card>
      <Flex alignItems="start" className="mb-2">
        <div className="truncate">
          <Text color="white">Annual Night Altitude</Text>
        </div>
      </Flex>
      {!detailsReady && <Text>Calculating...</Text>}
      {details && timezone && (
        <SkyAltChart
          timezone={timezone}
          times={details.details.map((detail) => detail.start)}
          alts={[
            {
              name: "Max Altitude",
              color: "blue",
              alts: details.details.map((detail) => detail.max_alt),
            },
            {
              name: "Min Altitude",
              color: "orange",
              alts: details.details.map((detail) => detail.min_alt),
            },
          ]}
        />
      )}
    </Card>
  );
}

export default function SkyObjectPage() {
  const { pageParams, setPage } = useNav();
  const { user, ready } = useAPI();
  const [openListDialog, setOpenListDialog] = useState(false);
  const [openShare, setOpenShare] = useState(false);

  const [objectReady, object] = usePostWithCache(
    pageParams.id && "get_space_object",
    {
      id: pageParams.id,
    }
  );
  const [objectDetailsReady, objectDetails] = usePostWithCache(
    pageParams.id && "get_space_object_details",
    {
      id: pageParams.id,
    }
  );

  const isOnList = user?.lists.find((list) =>
    list.objects.find((obj) => obj.id === pageParams.id)
  );

  const rightIcons = [
    {
      icon: ShareIcon,
      onClick: () => setOpenShare(true),
    },
  ];
  if (user) {
    rightIcons.push({
      icon: isOnList ? ListBulletIcon : PlusIcon,
      onClick: () => setOpenListDialog(true),
    });
  }

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title={object?.name || pageParams.name}
        subtitle={""}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => setPage("/sky")}
        rightIcons={rightIcons}
        loading={!objectReady || !ready}
      />

      <ShareLinkDialog
        open={openShare}
        setOpen={setOpenShare}
        path={`/sky/object?id=${object?.id}`}
        title={`Share ${object?.name}`}
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

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      {object && (
        <Grid numItemsMd={2} numItemsLg={3} className="mt-3 gap-1 ml-2 mr-2">
          {object.description && <OverviewCard object={object} />}
          {object.ra && <SurveyCard object={object} />}
          <DetailsCard
            details={objectDetails}
            detailsReady={objectDetailsReady}
            timezone={user.timezone}
          />
          {object.names.length > 0 && <NameCard object={object} />}
        </Grid>
      )}
    </div>
  );
}
