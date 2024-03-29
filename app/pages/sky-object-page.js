"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ArrowUturnLeftIcon,
  ListBulletIcon,
  ShareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { Card, Flex, Text, List, ListItem, Grid, Button } from "@tremor/react";
import { useNav } from "../nav";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import {
  useAPI,
  useAnalytics,
  usePostWithCache,
  useControlledPostWithCache,
} from "../api";
import ListDialog from "../components/list-dialog";
import ObjectImage from "../components/object-image";
import SkyAltChart from "../components/sky-alt-chart";
import ShareLinkDialog from "../components/share-link-dialog";
import { SKY_SURVEYS } from "./../sky-surveys";
import { objectSize, formatTime, formatLocation } from "../utils";

const USEFUL_PREFIXES = [
  "NAME ",
  "M ",
  "UGC ",
  "NGC ",
  "APG ",
  "IC ",
  "SR ",
  "DESIGNATION ",
];

function DetailsCard({
  object,
  objectPosition,
  objectPositionReady,
  objectPositionLoad,
  objectPositionLoading,
}) {
  return (
    <Card>
      <Flex alignItems="start " className="mb-2">
        <div className="truncate">
          <Text color="white">Details</Text>
        </div>
      </Flex>
      {objectPositionLoading && <Text>Calculating...</Text>}
      <List>
        {object.ra && (
          <ListItem>
            <Text color="slate-400">RA / DEC</Text>
            <Text color="slate-400">
              {object.ra.toFixed(2)} / {object.dec.toFixed(2)}
            </Text>
          </ListItem>
        )}
        {objectPosition && (
          <ListItem>
            <Text color="slate-400">ALT / AZ</Text>
            <Text color="slate-400">
              {Math.round(objectPosition.alt)}° /{" "}
              {Math.round(objectPosition.az)}°
            </Text>
          </ListItem>
        )}
        {!object.ra && objectPosition && (
          <ListItem>
            <Text color="slate-400">RA / DEC</Text>
            <Text color="slate-400">
              {objectPosition.ra.toFixed(2)} / {objectPosition.dec.toFixed(2)}
            </Text>
          </ListItem>
        )}
        {objectPosition && (
          <ListItem>
            <Text color="slate-400">LAT / LON</Text>
            <Text color="slate-400">
              {formatLocation(objectPosition.lat, objectPosition.lon, " / ")}
            </Text>
          </ListItem>
        )}
        {object.sizeMajor && (
          <ListItem>
            <Text color="slate-400">SIZE</Text>
            <Text color="slate-400">{objectSize(object)}</Text>
          </ListItem>
        )}
        {object.fluxV && (
          <ListItem>
            <Text color="slate-400">APPARENT MAGNITUDE</Text>
            <Text color="slate-400">{object.fluxV.toFixed(2)}</Text>
          </ListItem>
        )}
      </List>
      {!objectPositionLoading && objectPositionReady && (
        <Flex className="justify-end mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            onClick={() => objectPositionLoad()}
          >
            Refresh
          </Button>
        </Flex>
      )}
    </Card>
  );
}

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
  if (names.length == 0) {
    names.push(`NAME ${object.name}`);
  }

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
              <Text color="slate-400">{key}</Text>
              <Text color="slate-400">{value.join(" ")}</Text>
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
          src={object.imgURL || "/600.png"}
          alt={object.name}
          crossorigin={object.imgURL ? "anonymous" : null}
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
              <ObjectImage object={object} source={survey.hips} />
            </Flex>
          </Flex>
        ))}
      </Grid>
    </Card>
  );
}

function AltitudeCard({
  objectDetailsLoad,
  objectDetailsLoading,
  objectDetailsReady,
  objectDetails,
  timezone,
}) {
  return (
    <Card>
      <Flex alignItems="start" className="mb-2">
        <div className="truncate">
          <Text color="white">Annual Min/Max Altitude</Text>
        </div>
      </Flex>
      {objectDetailsLoading && <Text>Calculating (up to 5m)...</Text>}
      {!objectDetailsLoading && objectDetailsReady && timezone && (
        <SkyAltChart
          timezone={timezone}
          times={objectDetails.details.map((detail) => detail.start)}
          notes={objectDetails.details.map(
            (detail) =>
              `Max at ${formatTime(
                detail.ts_at_max_alt || 0,
                timezone,
                true
              )}, AZ ${Math.round(detail.az_at_max_alt || 0)}°`
          )}
          alts={[
            {
              name: "Max Altitude",
              color: "blue",
              alts: objectDetails.details.map((detail) => detail.max_alt),
            },
            {
              name: "Min Altitude",
              color: "orange",
              alts: objectDetails.details.map((detail) => detail.min_alt),
            },
          ]}
        />
      )}
      {!objectDetailsLoading && objectDetailsReady && (
        <Flex className="justify-end mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            onClick={() => objectDetailsLoad()}
          >
            Refresh
          </Button>
        </Flex>
      )}
      {!objectDetailsLoading && !objectDetailsReady && (
        <Flex className="justify-around mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="secondary"
            onClick={() => objectDetailsLoad()}
          >
            Load
          </Button>
        </Flex>
      )}
    </Card>
  );
}

export default function SkyObjectPage() {
  const { pageParams, setPage } = useNav();
  const { user, ready } = useAPI();
  const [openListDialog, setOpenListDialog] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const emitEvent = useAnalytics();

  const [objectReady, object] = usePostWithCache(
    pageParams.id && "get_space_object",
    {
      id: pageParams.id,
    }
  );

  useEffect(() => {
    if (objectReady) {
      emitEvent(`object_view_${object.name}`);
    }
  }, [objectReady, object, emitEvent]);

  const [
    objectDetailsLoad,
    objectDetailsReady,
    objectDetailsLoading,
    objectDetails,
  ] = useControlledPostWithCache(object && "get_space_object_details", {
    id: object?.id,
  });

  const [
    objectPositionLoad,
    objectPositionReady,
    objectPositionLoading,
    objectPosition,
  ] = useControlledPostWithCache(
    pageParams.id && "get_space_object_current",
    {
      id: pageParams.id,
    },
    true
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
        loading={!objectReady || !ready || !objectPositionReady}
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
                object: object,
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
          {object && user && object.type != "EARTH_SATELLITE" && (
            <AltitudeCard
              objectDetailsLoad={objectDetailsLoad}
              objectDetailsLoading={objectDetailsLoading}
              objectDetailsReady={objectDetailsReady}
              objectDetails={objectDetails}
              timezone={user.timezone}
            />
          )}
          {object && (
            <DetailsCard
              object={object}
              objectPosition={objectPosition}
              objectPositionLoad={objectPositionLoad}
              objectPositionLoading={objectPositionLoading}
              objectPositionReady={objectPositionReady}
            />
          )}
          {object && <NameCard object={object} />}
        </Grid>
      )}
    </div>
  );
}
