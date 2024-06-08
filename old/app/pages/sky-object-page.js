"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PlusIcon,
  ArrowUturnLeftIcon,
  ListBulletIcon,
  ShareIcon,
  ArrowPathIcon,
  SparklesIcon,
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
  Switch,
} from "@tremor/react";
import { useCallWithCache } from "../python";
import { useNav } from "../nav";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import { useAPI, useAnalytics, useObject } from "../api";
import { useControlledCallWithCache } from "../python";
import ListDialog from "../components/list-dialog";
import ObjectImage from "../components/object-image";
import SkyAltChart from "../components/sky-alt-chart";
import ShareLinkDialog from "../components/share-link-dialog";
import SkyFullScreenDialog from "../components/sky-fullscreen-dialog";
import { SKY_SURVEYS } from "./../data/sky-surveys";
import {
  objectSize,
  formatTime,
  formatLocation,
  equipmentToDimensions,
} from "../utils";
import dynamic from "next/dynamic";

const MapFullScreenDialog = dynamic(
  () => import("../components/map-fullscreen-dialog"),
  {
    ssr: false,
  }
);

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

function CurrentCard({ object, dataProps, timezone }) {
  const [showMap, setShowMap] = useState(false);
  const [showSky, setShowSky] = useState(false);
  return (
    <Card>
      <Flex alignItems="start " className="mb-2">
        <div className="truncate">
          <Text color="white">Live Details</Text>
        </div>
      </Flex>
      <List>
        {object.ra && (
          <ListItem onClick={() => setShowSky(true)}>
            <Text color="slate-400">RA / DEC</Text>
            <Text color="slate-400 underline decoration-dotted underline-offset-4 cursor-pointer">
              {object.ra.toFixed(2)} / {object.dec.toFixed(2)}
            </Text>
          </ListItem>
        )}
        {dataProps.result && (
          <ListItem onClick={() => setShowSky(true)}>
            <SkyFullScreenDialog
              open={showSky}
              object={object}
              setOpen={setShowSky}
              curPos={{ alt: dataProps.result.alt, az: dataProps.result.az }}
              timezone={timezone}
            />
            <Text color="slate-400">ALT / AZ</Text>
            <Text color="slate-400 underline decoration-dotted underline-offset-4 cursor-pointer">
              {Math.round(dataProps.result.alt)}° /{" "}
              {Math.round(dataProps.result.az)}°
            </Text>
          </ListItem>
        )}
        {!object.ra && dataProps.result && (
          <ListItem onClick={() => setShowSky(true)}>
            <Text color="slate-400">RA / DEC</Text>
            <Text color="slate-400 underline decoration-dotted underline-offset-4 cursor-pointer">
              {dataProps.result.ra.toFixed(2)} /{" "}
              {dataProps.result.dec.toFixed(2)}
            </Text>
          </ListItem>
        )}
        {dataProps.result && (
          <ListItem onClick={() => setShowMap(true)}>
            <MapFullScreenDialog
              open={showMap}
              setOpen={setShowMap}
              lat={dataProps.result.lat}
              lon={dataProps.result.lon}
              popupTitle={`${object.name} is directly overhead this location`}
            />
            <Text color="slate-400">LAT / LON</Text>
            <Text color="slate-400 underline decoration-dotted underline-offset-4 cursor-pointer">
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
      {dataProps.loading && dataProps.result && (
        <Flex className="justify-end mt-3">
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            color="gray"
            disabled={true}
          >
            Computing...
          </Button>
        </Flex>
      )}
      {!dataProps.loading && dataProps.result && (
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
  const { user } = useAPI();
  return (
    <Card>
      <Flex alignItems="start">
        <div className="truncate">
          <Text color="white">Sky Surveys</Text>
        </div>
      </Flex>
      {user &&
        user.equipment.map((eq) => (
          <div key={eq.id}>
            <Text color="slate-400 mt-3">
              {equipmentToDimensions(eq).title}
            </Text>
            <Grid
              numItems={2}
              numItemsSm={2}
              numItemsMd={4}
              numItemsLg={4}
              className="mt-2 gap-1 ml-2 mr-2"
            >
              {SKY_SURVEYS.map((survey) => (
                <Flex className="flex-col" key={survey.hips + eq.id}>
                  <Text color="slate-300">{survey.name}</Text>
                  <Flex className="border-solid border-2 border-gray-700">
                    <ObjectImage
                      object={object}
                      source={survey.hips}
                      equipment={eq}
                    />
                  </Flex>
                </Flex>
              ))}
            </Grid>
          </div>
        ))}
    </Card>
  );
}

function LongTermCard({ object, dataProps, timezone }) {
  const [showDialog, setShowDialog] = useState(false);
  const result =
    dataProps.result && Object.values(dataProps.result).filter((x) => !!x);
  return (
    <Card>
      <Flex alignItems="start" className="mb-2">
        <div className="truncate">
          <Text color="white">Annual Position</Text>
        </div>
      </Flex>
      <SkyFullScreenDialog
        object={object}
        open={showDialog}
        setOpen={setShowDialog}
        longTermDays={result}
        timezone={timezone}
      />
      {result && timezone && (
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
      <Flex className="justify-around mt-3">
        {!dataProps.loading && result && (
          <Button
            icon={SparklesIcon}
            variant="secondary"
            onClick={() => setShowDialog(true)}
          >
            View 3D
          </Button>
        )}
        {!dataProps.loading && result && (
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            onClick={() => dataProps.load()}
          >
            Refresh
          </Button>
        )}
        {dataProps.loading && result && (
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            color="gray"
            disabled={true}
          >
            Computing... {Math.floor((result.length / 365) * 100)}%
          </Button>
        )}
        {!dataProps.loading && !result && (
          <Button
            icon={ArrowPathIcon}
            variant="secondary"
            onClick={() => dataProps.load()}
          >
            Load
          </Button>
        )}
      </Flex>
    </Card>
  );
}

function SatellitePassesCard({ dataProps, timezone }) {
  const [visibleOnly, setVisibleOnly] = useState(true);
  const result =
    dataProps.result && Object.values(dataProps.result).filter((x) => !!x);
  const passes = useMemo(() => {
    const passes = [];
    if (result) {
      for (let dayDetail of result) {
        if (!dayDetail?.satellite_passes) continue;
        for (let pass of dayDetail.satellite_passes) {
          if (visibleOnly && !pass.sunlit) continue;
          passes.push(pass);
        }
      }
    }
    return passes;
  }, [result, visibleOnly]);
  return (
    <Card>
      <Flex alignItems="start" className="mb-2">
        <div className="truncate">
          <Text color="white">Satellite Passes</Text>
        </div>
      </Flex>
      <Flex className="justify-around mt-3">
        {!dataProps.loading && result && (
          <div className="flex items-center space-x-3">
            <Switch
              id="switch"
              name="switch"
              checked={visibleOnly}
              onChange={() => setVisibleOnly((vo) => !vo)}
            />
            <label htmlFor="switch" className="text-slate-400">
              Visible Passes Only
            </label>
          </div>
        )}
        {dataProps.loading && (
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            color="gray"
            disabled={true}
          >
            Computing...
          </Button>
        )}
        {!dataProps.loading && result && (
          <Button
            icon={ArrowPathIcon}
            variant="primary"
            onClick={() => dataProps.load()}
          >
            Refresh
          </Button>
        )}
        {!dataProps.loading && !result && (
          <Button
            icon={ArrowPathIcon}
            variant="secondary"
            onClick={() => dataProps.load()}
          >
            Load
          </Button>
        )}
      </Flex>
      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Duration</TableHeaderCell>
            <TableHeaderCell>Rise</TableHeaderCell>
            <TableHeaderCell>Peak</TableHeaderCell>
            <TableHeaderCell>Set</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody className="text-slate-400">
          {passes.map((pass) => {
            const durationMins = (
              (pass.ts_end - pass.ts_start) /
              1000 /
              60
            ).toFixed(1);
            return (
              <TableRow key={pass.ts_start}>
                <TableCell>
                  <Text className="text-slate-400">
                    {new Date(pass.ts_start).toLocaleDateString("en-US", {
                      timeZone: timezone,
                    })}
                  </Text>
                  <br />
                  {pass.sunlit ? (
                    <Badge color="yellow">Visible</Badge>
                  ) : (
                    <Badge color="gray">Shadow</Badge>
                  )}
                </TableCell>
                <TableCell>{durationMins} mins</TableCell>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

export default function SkyObjectPage() {
  const { pageParams, goBack } = useNav();
  const { user, location, ready } = useAPI();
  const [openListDialog, setOpenListDialog] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const emitEvent = useAnalytics();

  const { ready: objectReady, object } = useObject(pageParams.id);

  const { result: objOrbits, ready: objOrbitsReady } = useCallWithCache(
    object && user && "get_orbit_calculations",
    location && object && `${location.id}_${object.id}_orbits`,
    object &&
      location && {
        objects: [object],
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
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
    location && pageParams.id && `${location.id}_${pageParams.id}_longterm`,
    location &&
      object && {
        object: object,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        start_days: 0,
        offset_days: 365,
      },
    { proactiveRequest: false }
  );

  const objPosProps = useControlledCallWithCache(
    "get_current_orbit_calculations",
    location && pageParams.id && `${location.id}_${pageParams.id}_current`,
    location &&
      object && {
        object: object,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
      },
    { proactiveRequest: true, refreshInterval: 1000 * 10 }
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
        {object && location && object.type != "EARTH_SATELLITE" && (
          <LongTermCard
            object={object}
            dataProps={objLongTermProps}
            timezone={location.timezone}
          />
        )}
        {object && location && objPosProps && (
          <CurrentCard
            object={object}
            dataProps={objPosProps}
            timezone={location.timezone}
          />
        )}
        {object && <NameCard object={object} />}
      </Grid>
      <Grid numItemsMd={1} numItemsLg={1} className="mt-1 gap-1 ml-2 mr-2">
        {object && location && object.type == "EARTH_SATELLITE" && (
          <SatellitePassesCard
            dataProps={objLongTermProps}
            timezone={location.timezone}
          />
        )}
      </Grid>
    </div>
  );
}