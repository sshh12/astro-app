import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "../colors";

export default function Text3D() {
  return (
    <Billboard>
      <Text position={[0, 2, 0]} color="white" fontSize={10}>
        {"TEST"}
      </Text>
    </Billboard>
  );
}
