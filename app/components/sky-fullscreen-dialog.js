"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Flex, Dialog, DialogPanel, Button } from "@tremor/react";
import {
  CameraSetter,
  SphereGrid,
  CameraControls,
  ObjectPoint,
  LongTermPath,
} from "./tools-3d";

export default function SkyFullScreenDialog({
  object,
  open,
  setOpen,
  curPos,
  longTermDays,
  timezone,
}) {
  const [showCanvas, setShowCanvas] = useState(false);
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setShowCanvas(true);
      }, 100);
    } else {
      setShowCanvas(false);
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} static={true}>
      <DialogPanel className="p-1">
        <div style={{ height: "88vh" }}>
          {showCanvas && (
            <Canvas>
              <CameraSetter />
              <SphereGrid />
              <CameraControls
                startAlt={curPos?.alt || 30}
                startAz={curPos?.az || 0}
              />
              {curPos && (
                <ObjectPoint alt={curPos.alt} az={curPos.az} object={object} />
              )}
              {longTermDays && (
                <LongTermPath longTermDays={longTermDays} timezone={timezone} />
              )}
            </Canvas>
          )}
        </div>
        <Flex className="mt-3 justify-center p-3">
          <Button variant="light" onClick={() => setOpen(false)} color="slate">
            Close
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
