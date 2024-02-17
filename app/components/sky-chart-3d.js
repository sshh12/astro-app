import React, { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../colors";

const altAzToCartesian = (alt, az, radius) => {
  const phi = THREE.MathUtils.degToRad(90 - alt);
  const theta = THREE.MathUtils.degToRad(az);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const TexturedPlane = ({ text }) => {
  const canvasTexture = useMemo(() => {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = 512;
    canvas.height = 256;

    // Draw background
    context.fillStyle = "red";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    context.font = "48px serif";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw text onto the canvas
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Use the canvas as a texture
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [text]);

  return (
    <mesh position={[1, 1, 1]}>
      <planeGeometry attach="geometry" args={[5, 2.5]} />
      <meshBasicMaterial attach="material" color="#fff" />
    </mesh>
  );
};

const SphereGrid = () => {
  const altLines = [];
  for (let alt = 0; alt <= 90; alt += 30) {
    const points = [];
    for (let az = 0; az <= 360; az += 5) {
      points.push(altAzToCartesian(alt, az, 2));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    altLines.push(
      <line key={`alt-${alt}`}>
        <lineBasicMaterial
          attach="material"
          color="white"
          transparent={true}
          opacity={0.5}
        />
        <primitive attach="geometry" object={lineGeometry} />
      </line>
    );
  }

  const azLines = [];
  for (let az = 0; az <= 360; az += 30) {
    const points = [];
    for (let alt = 0; alt <= 90; alt += 5) {
      points.push(altAzToCartesian(alt, az, 2));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    azLines.push(
      <line key={`az-${az}`}>
        <lineBasicMaterial
          attach="material"
          color="white"
          transparent={true}
          opacity={0.5}
        />
        <primitive attach="geometry" object={lineGeometry} />
      </line>
    );
  }

  return (
    <>
      {altLines}
      {azLines}
    </>
  );
};

const ObjectPath = ({ object }) => {
  const points = [];
  for (let i in object.az) {
    if (object.alt[i] > 0) {
      points.push(altAzToCartesian(object.alt[i], object.az[i], 2));
    } else {
      break;
    }
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const color = COLORS[object.color.toLowerCase()];
  return (
    <line key={`object-${object.name}`}>
      <lineBasicMaterial attach="material" color={color} />
      <primitive attach="geometry" object={lineGeometry} />
    </line>
  );
};

const CameraControls = () => {
  const { camera, gl } = useThree();

  useEffect(() => {
    window.dragging = false;
    window.alt = 30;
    window.az = 0;

    const vector = altAzToCartesian(window.alt, window.az, 2);
    camera.lookAt(vector);

    const onMouseDown = (event) => {
      event.preventDefault();
      window.dragging = true;
      window.prev = !event.touches
        ? {
            x: event.clientX,
            y: event.clientY,
          }
        : {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
    };

    const onMouseMove = (event) => {
      if (window.dragging) {
        event.preventDefault();
        const deltaMove = !event.touches
          ? {
              x: event.clientX - window.prev.x,
              y: event.clientY - window.prev.y,
            }
          : {
              x: event.touches[0].clientX - window.prev.x,
              y: event.touches[0].clientY - window.prev.y,
            };

        window.alt = Math.min(
          Math.max(window.alt + deltaMove.y * 0.5, 0.0),
          89
        );
        window.az -= deltaMove.x * 0.5;

        const vector = altAzToCartesian(window.alt, window.az, 2);
        camera.lookAt(vector);

        window.prev = !event.touches
          ? {
              x: event.clientX,
              y: event.clientY,
            }
          : {
              x: event.touches[0].clientX,
              y: event.touches[0].clientY,
            };
      }
    };

    const onMouseUp = () => {
      window.dragging = false;
    };

    gl.domElement.addEventListener("mousedown", onMouseDown);
    gl.domElement.addEventListener("mousemove", onMouseMove);
    gl.domElement.addEventListener("mouseup", onMouseUp);
    gl.domElement.addEventListener("touchstart", onMouseDown);
    gl.domElement.addEventListener("touchmove", onMouseMove);
    gl.domElement.addEventListener("touchend", onMouseUp);

    return () => {
      gl.domElement.removeEventListener("mousedown", onMouseDown);
      gl.domElement.removeEventListener("mousemove", onMouseMove);
      gl.domElement.removeEventListener("mouseup", onMouseUp);
      gl.domElement.removeEventListener("touchstart", onMouseDown);
      gl.domElement.removeEventListener("touchmove", onMouseMove);
      gl.domElement.removeEventListener("touchend", onMouseUp);
    };
  }, [gl.domElement]);

  return null;
};

function CameraSetter() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.01, 0);
  }, [camera]);

  return null;
}

export default function SkyChart3D({ times, timeStates, timezone, objects }) {
  return (
    <div style={{ height: "20rem" }}>
      <Canvas>
        <CameraSetter />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SphereGrid />
        <CameraControls />
        {objects.map((object) => (
          <ObjectPath key={object.name} object={object} />
        ))}
        <TexturedPlane text="Hello, Three.js!" />
      </Canvas>
    </div>
  );
}
