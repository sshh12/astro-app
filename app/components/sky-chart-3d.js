import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

// Helper function to convert alt/az to Cartesian coordinates
const altAzToCartesian = (alt, az, radius) => {
  const phi = THREE.MathUtils.degToRad(90 - alt);
  const theta = THREE.MathUtils.degToRad(az);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const SphereGrid = ({ radius = 2, divisions = 8 }) => {
  // Create an array of latitude lines (parallels)
  const latitudeLines = [];
  for (let i = 0; i <= divisions; i++) {
    const phi = (i * Math.PI) / divisions;
    const points = [];
    for (let j = 0; j <= divisions * 3; j++) {
      const theta = (j * 2 * Math.PI) / (divisions * 3);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      points.push(new THREE.Vector3(x, y, z));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    latitudeLines.push(
      <line key={`latitude-${i}`}>
        <lineBasicMaterial attach="material" color="white" />
        <primitive attach="geometry" object={lineGeometry} />
      </line>
    );
  }
  // Create an array of longitude lines (meridians)
  const longitudeLines = [];
  for (let i = 0; i < divisions; i++) {
    const theta = (i * 2 * Math.PI) / divisions;
    const points = [];
    for (let j = 0; j <= divisions * 3; j++) {
      const phi = (j * Math.PI) / (divisions * 3);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      points.push(new THREE.Vector3(x, y, z));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    longitudeLines.push(
      <line key={`longitude-${i}`}>
        <lineBasicMaterial attach="material" color="white" />
        <primitive attach="geometry" object={lineGeometry} />
      </line>
    );
  }

  return (
    <>
      {latitudeLines}
      {longitudeLines}
    </>
  );
};

const HalfSphere = ({ alt, az }) => {
  const meshRef = useRef();

  // Convert alt/az to Cartesian coordinates for the trajectory
  const trajectoryStart = new THREE.Vector3(0, 0, 0);
  const trajectoryEnd = altAzToCartesian(alt, az, 2); // Assuming a unit sphere radius of 1

  // Create the trajectory geometry
  const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints([
    trajectoryStart,
    trajectoryEnd,
  ]);

  // Update the sphere rotation over time
  useFrame(() => {
    if (meshRef.current) {
      // meshRef.current.rotation.x += 0.01;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 32, 32, 0, Math.PI]} />
        <meshStandardMaterial
          color="red"
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
      {/* <line geometry={trajectoryGeometry}>
        <lineBasicMaterial color="yellow" />
      </line> */}
    </>
  );
};

function CameraSetter() {
  const { camera } = useThree();

  useEffect(() => {
    // camera.position.set(0, 0, 0);
    // camera.lookAt(0, 0, 1);
  }, [camera]);

  return null;
}

export default function SkyChart3D({ alt = 35, az = 135 }) {
  return (
    <div style={{ height: "20rem" }}>
      <Canvas>
        <CameraSetter />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <HalfSphere alt={alt} az={az} />
        <SphereGrid />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}
