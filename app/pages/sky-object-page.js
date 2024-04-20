"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  ArrowUturnLeftIcon,
  ListBulletIcon,
  ShareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  Flex,
  Text,
  List,
  ListItem,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Badge,
} from "@tremor/react";
import { useCallWithCache } from "../python";
import { useNav } from "../nav";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import { useAPI, useAnalytics, usePostWithCache } from "../api";
import { useControlledCallWithCache } from "../python";
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

function DetailsCard({ object, dataProps }) {
  return (
    <Card>
      <Flex alignItems="start " className="mb-2">
        <div className="truncate">
          <Text color="white">Details</Text>
        </div>
      </Flex>
      <List>
        {object.ra && (
          <ListItem>
            <Text color="slate-400">RA / DEC</Text>
            <Text color="slate-400">
              {object.ra.toFixed(2)} / {object.dec.toFixed(2)}
            </Text>
          </ListItem>
        )}
        {dataProps.result && (
          <ListItem>
            <Text color="slate-400">ALT / AZ</Text>
            <Text color="slate-400">
              {Math.round(dataProps.result.alt)}° /{" "}
              {Math.round(dataProps.result.az)}°
            </Text>
          </ListItem>
        )}
        {!object.ra && dataProps.result && (
          <ListItem>
            <Text color="slate-400">RA / DEC</Text>
            <Text color="slate-400">
              {dataProps.result.ra.toFixed(2)} /{" "}
              {dataProps.result.dec.toFixed(2)}
            </Text>
          </ListItem>
        )}
        {dataProps.result && (
          <ListItem>
            <Text color="slate-400">LAT / LON</Text>
            <Text color="slate-400">
              {formatLocation(
                dataProps.result.lat,
                dataProps.result.lon,
                " / "
              )}
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
      {!dataProps.loading && dataProps.ready && (
        <Flex className="justify-end mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            onClick={() => dataProps.load()}
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
            <ListItem key={key + value}>
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
        <Text color="slate-400">{object.description}</Text>
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

function AltitudeCard({ dataProps, timezone }) {
  const result =
    dataProps.result && Object.values(dataProps.result).filter((x) => !!x);
  return (
    <Card>
      <Flex alignItems="start" className="mb-2">
        <div className="truncate">
          <Text color="white">Annual Min/Max Altitude</Text>
        </div>
      </Flex>
      {dataProps.loading && <Text>Calculating (up to 5m)...</Text>}
      {!dataProps.loading && result && timezone && (
        <SkyAltChart
          timezone={timezone}
          times={result.map((detail) => detail.start)}
          notes={result.map(
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
              alts: Object.values(result).map((detail) => detail.max_alt),
            },
            {
              name: "Min Altitude",
              color: "orange",
              alts: Object.values(result).map((detail) => detail.min_alt),
            },
          ]}
        />
      )}
      {!dataProps.loading && dataProps.ready && (
        <Flex className="justify-end mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            onClick={() => dataProps.load()}
          >
            Refresh
          </Button>
        </Flex>
      )}
      {!dataProps.loading && !dataProps.ready && (
        <Flex className="justify-around mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="secondary"
            onClick={() => dataProps.load()}
          >
            Load
          </Button>
        </Flex>
      )}
    </Card>
  );
}

function SatellitePassesCard({ dataProps, timezone }) {
  const result =
    dataProps.result && Object.values(dataProps.result).filter((x) => !!x);
  const passes = [];
  if (result) {
    for (let dayDetail of result) {
      if (!dayDetail?.satellite_passes) continue;
      passes.push(...dayDetail.satellite_passes);
    }
  }
  return (
    <Card>
      <Flex alignItems="start" className="mb-2">
        <div className="truncate">
          <Text color="white">Satellite Passes</Text>
        </div>
      </Flex>
      {dataProps.loading && <Text>Calculating (up to 5m)...</Text>}
      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Rise</TableHeaderCell>
            <TableHeaderCell>Peak</TableHeaderCell>
            <TableHeaderCell>Set</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className="text-slate-400">
          {passes.map((pass) => (
            <TableRow key={pass.ts_start}>
              <TableCell>
                {new Date(pass.ts_start).toLocaleDateString("en-US", {
                  timeZone: timezone,
                })}
                <br />
                <Text>&nbsp;</Text>
              </TableCell>
              <TableCell>
                {new Date(pass.ts_start).toLocaleTimeString("en-US", {
                  timeZone: timezone,
                })}
                <br />
                <Text>
                  ALT {Math.round(pass.alt_start)}° / AZ{" "}
                  {Math.round(pass.az_start)}°
                </Text>
              </TableCell>
              <TableCell>
                {new Date(pass.ts_culminate).toLocaleTimeString("en-US", {
                  timeZone: timezone,
                })}
                <br />
                <Text>
                  ALT {Math.round(pass.alt_culminate)}° / AZ{" "}
                  {Math.round(pass.az_culminate)}°
                </Text>
              </TableCell>
              <TableCell>
                {new Date(pass.ts_end).toLocaleTimeString("en-US", {
                  timeZone: timezone,
                })}
                <br />
                <Text>
                  ALT {Math.round(pass.alt_culminate)}° / AZ{" "}
                  {Math.round(pass.az_culminate)}°
                </Text>
              </TableCell>
              <TableCell>
                {pass.sunlit ? (
                  <Badge color="yellow">Visable</Badge>
                ) : (
                  <Badge color="gray">Shadow</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!dataProps.loading && dataProps.ready && (
        <Flex className="justify-end mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            onClick={() => dataProps.load()}
          >
            Refresh
          </Button>
        </Flex>
      )}
      {!dataProps.loading && !dataProps.ready && (
        <Flex className="justify-around mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="secondary"
            onClick={() => dataProps.load()}
          >
            Load
          </Button>
        </Flex>
      )}
    </Card>
  );
}

export default function SkyObjectPage() {
  const { pageParams, goBack } = useNav();
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

  const { result: objOrbits, ready: objOrbitsReady } = useCallWithCache(
    object && user && "get_orbit_calculations",
    object?.id + "_orbits",
    object &&
      user && {
        objects: [object],
        timezone: user.timezone,
        lat: user.lat,
        lon: user.lon,
        elevation: user.elevation,
        resolution_mins: 10,
      }
  );

  useEffect(() => {
    if (objectReady) {
      emitEvent(`object_view_${object.name}`);
    }
  }, [objectReady, object, emitEvent]);

  const objLongTermProps = useControlledCallWithCache(
    "get_longterm_orbit_calculations",
    pageParams.id && pageParams.id + "_longterm",
    user &&
      object && {
        object: object,
        timezone: user.timezone,
        lat: user.lat,
        lon: user.lon,
        elevation: user.elevation,
        start_days: 0,
        offset_days: 365,
      },
    { proactiveRequest: false }
  );

  const objPosProps = useControlledCallWithCache(
    "get_current_orbit_calculations",
    pageParams.id && pageParams.id + "_current",
    user &&
      object && {
        object: object,
        timezone: user?.timezone,
        lat: user?.lat,
        lon: user?.lon,
        elevation: user?.elevation,
      },
    { proactiveRequest: true }
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
        leftIconOnClick={() => goBack()}
        rightIcons={rightIcons}
        loading={!objectReady || !ready}
        computing={
          objPosProps.loading || !objOrbitsReady || objLongTermProps.loading
        }
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
        {objOrbits && (
          <SkyChartPanel
            times={objOrbits.time}
            timeStates={objOrbits.time_state}
            timezone={objOrbits.timezone}
            objects={[
              {
                alt: objOrbits.objects[object.id].alt,
                az: objOrbits.objects[object.id].az,
                name: object.name,
                color: object.color,
                object: object,
              },
            ]}
          />
        )}
        {!objOrbits && (
          <SkyChartPanel times={[]} timeStates={[]} objects={[]} />
        )}
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      <Grid numItemsMd={2} numItemsLg={2} className="mt-3 gap-1 ml-2 mr-2">
        {object && object.description && <OverviewCard object={object} />}
        {object && object.ra && <SurveyCard object={object} />}
        {object && user && object.type != "EARTH_SATELLITE" && (
          <AltitudeCard dataProps={objLongTermProps} timezone={user.timezone} />
        )}
        {object && objPosProps && (
          <DetailsCard object={object} dataProps={objPosProps} />
        )}
        {object && <NameCard object={object} />}
      </Grid>
      <Grid numItemsMd={1} numItemsLg={1} className="mt-1 gap-1 ml-2 mr-2">
        {object && user && object.type == "EARTH_SATELLITE" && (
          <SatellitePassesCard
            dataProps={objLongTermProps}
            timezone={user.timezone}
          />
        )}
      </Grid>
    </div>
  );
}
