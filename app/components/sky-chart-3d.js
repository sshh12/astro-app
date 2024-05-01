import React from "react";
import { Canvas } from "@react-three/fiber";
import {
  CameraSetter,
  SphereGrid,
  CameraControls,
  ObjectPath,
} from "./tools-3d";

export default function SkyChart3D({ times, timeStates, timezone, objects }) {
  return (
    <div style={{ height: "20rem", maxWidth: "40rem", margin: "auto" }}>
      <Canvas>
        <CameraSetter />
        <SphereGrid />
        <CameraControls />
        {objects.map((object) => (
          <ObjectPath key={object.name} object={object} times={times} />
        ))}
      </Canvas>
    </div>
  );
}
