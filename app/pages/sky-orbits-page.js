"use client";

import React, { useEffect, useState } from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAPI } from "../api";
import { Flex, Button } from "@tremor/react";
import { useCallWithCache } from "../python";
import { Canvas } from "@react-three/fiber";
import {
  CameraSetter,
  SphereGrid,
  CameraControls,
  ObjectPath,
} from "../components/tools-3d";
import LoadingBar from "../components/loading-bar";

function OrbitsHeader({
  leftIcon,
  leftIconOnClick,
  rightIcons = [],
  loading = false,
  computing = false,
}) {
  return (
    <div>
      <LoadingBar loading={loading} color={"rgb(34, 197, 94)"} />
      <LoadingBar loading={computing} color={"rgb(195, 217, 255)"} />
      <Flex
        className="sticky-top bg-slate-800 flex items-center justify-between w-full"
        style={{ padding: "8px 10px 8px 12px" }}
      >
        {leftIcon && (
          <Button
            onClick={leftIconOnClick}
            color="slate-800"
            icon={leftIcon}
          ></Button>
        )}
        {!rightIcons && <div style={{ width: "50px" }}></div>}

        {rightIcons.length > 0 && (
          <div className="justify-end ml-auto">
            {rightIcons.map((v, i) => (
              <Button
                key={i}
                onClick={v.onClick}
                color="slate-800"
                icon={v.icon}
              ></Button>
            ))}
          </div>
        )}
      </Flex>
    </div>
  );
}

export default function SkyOrbitsPage() {
  const { pageParams, goBack } = useNav();
  const [orbitObjects, setOrbitObjects] = useState([]);

  const { objectStore, location } = useAPI();

  useEffect(() => {
    if (pageParams.orbitObjectIds && objectStore) {
      // dev hack
      if (typeof pageParams.orbitObjectIds === "string") {
        pageParams.orbitObjectIds = pageParams.orbitObjectIds.split(",");
      }
      if (pageParams.orbitObjectIds.length === 0) {
        return;
      }
      Promise.all(
        pageParams.orbitObjectIds.map((id) => objectStore.getItem(id))
      ).then((objects) => {
        setOrbitObjects(objects.filter((o) => !!o));
      });
    }
  }, [pageParams, objectStore]);

  const { ready: orbitsReady, result: orbits } = useCallWithCache(
    "get_orbit_calculations",
    location && orbitObjects && `${location.id}_${orbitObjects.length}_orbits`,
    location &&
      orbitObjects && {
        objects: orbitObjects,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      }
  );
  return (
    <div className="bg-slate-800">
      <OrbitsHeader
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => goBack()}
        loading={false}
        computing={!orbitObjects || !orbitsReady}
      />
      <div style={{ height: "calc(100vh)" }}>
        <Canvas>
          <CameraSetter />
          <SphereGrid />
          <CameraControls startAlt={20} startAz={0} />
          {orbits &&
            Object.values(orbits.objects).length === orbitObjects.length &&
            orbitObjects.map((obj) => (
              <ObjectPath
                key={obj.name}
                object={{
                  alt: orbits.objects[obj.id].alt,
                  az: orbits.objects[obj.id].az,
                  name: obj.name,
                  color: obj.color,
                  object: obj,
                }}
                times={orbits.time}
              />
            ))}
        </Canvas>
      </div>
    </div>
  );
}
