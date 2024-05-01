"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Flex, Dialog, DialogPanel, Button } from "@tremor/react";
import {
  CameraSetter,
  SphereGrid,
  CameraControls,
  ObjectPoint,
} from "./tools-3d";

export default function SkyFullScreenDialog({
  object,
  open,
  setOpen,
  alt,
  az,
}) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} static={true}>
      <DialogPanel style={{ height: "88vh" }} className="p-1">
        <Canvas>
          <CameraSetter />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <SphereGrid />
          <CameraControls startAlt={alt} startAz={az} />
          <ObjectPoint alt={alt} az={az} object={object} />
        </Canvas>
        <Flex className="mt-3 justify-center p-3">
          <Button variant="light" onClick={() => setOpen(false)} color="slate">
            Close
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
