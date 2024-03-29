import React, { useEffect, useRef, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { COLORS } from "../colors";
import { useTimestamp, getInterpolatedValue } from "../utils";

const RADIUS = 2;
const TRACER_OFFSET = 1000 * 60 * 60 * 2;

const altAzToCartesian = (alt, az, radius) => {
  const phi = THREE.MathUtils.degToRad(90 - alt);
  const theta = THREE.MathUtils.degToRad(az);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const TextMark = ({ text, position }) => {
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 100;
    canvas.height = 100;
    context.font = "bold 100px serif";
    context.fillStyle = "#3b82f6";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [text]);

  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      const target = new THREE.Vector3(0, 0, 0);
      meshRef.current.lookAt(target);
    }
  }, []);

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry attach="geometry" args={[0.2, 0.2]} />
      <meshBasicMaterial
        attach="material"
        map={canvasTexture}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
};

const TextLabel = ({ text, position, color }) => {
  const width = text.length;
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 100 * width;
    canvas.height = 100;
    context.font = "100px Verdana, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.strokeStyle = "black";
    context.lineWidth = 14;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [text, color, width]);

  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      const target = new THREE.Vector3(0, 0, 0);
      meshRef.current.lookAt(target);
    }
  }, []);

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry attach="geometry" args={[0.12 * width, 0.12]} />
      <meshBasicMaterial
        attach="material"
        map={canvasTexture}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
};

const SphereGrid = () => {
  const altLines = [];
  for (let alt = 0; alt <= 90; alt += 30) {
    const points = [];
    for (let az = 0; az <= 360; az += 5) {
      points.push(altAzToCartesian(alt, az, RADIUS));
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

  const posNorth = altAzToCartesian(0, 0, RADIUS);
  const posSouth = altAzToCartesian(180, 0, RADIUS);
  const posEast = altAzToCartesian(0, 90, RADIUS);
  const posWest = altAzToCartesian(0, 270, RADIUS);

  return (
    <>
      {altLines}
      {azLines}
      <TextMark text="N" position={posNorth} />
      <TextMark text="S" position={posSouth} />
      <TextMark text="E" position={posEast} />
      <TextMark text="W" position={posWest} />
    </>
  );
};

const ObjectPath = ({ object, times }) => {
  const { ts } = useTimestamp();
  const tracerMesh = useRef();
  const tracerOffset = useRef(0);
  useFrame(() => {
    if (!tracerMesh.current) return;
    const altTracer = getInterpolatedValue(
      times,
      ts + tracerOffset.current,
      object.alt
    );
    const azTracer = getInterpolatedValue(
      times,
      ts + tracerOffset.current,
      object.az
    );
    const posTracer = altAzToCartesian(altTracer, azTracer, RADIUS);
    tracerMesh.current.position.x = posTracer.x;
    tracerMesh.current.position.y = posTracer.y;
    tracerMesh.current.position.z = posTracer.z;
    tracerOffset.current += 1000 * 60;
    if (tracerOffset.current > TRACER_OFFSET) {
      tracerOffset.current = -TRACER_OFFSET;
    }
    tracerMesh.current.visible = altTracer > 0;
  });

  const lines = [];
  let longestMidPoint = null;
  let longestLength = 0;
  let points = [];
  for (let i in object.az) {
    points.push(altAzToCartesian(object.alt[i], object.az[i], RADIUS));
  }
  if (points.length > 0) {
    if (points.length > longestLength) {
      longestLength = points.length;
      longestMidPoint = points[Math.floor(points.length / 2)];
    }
    lines.push(new THREE.BufferGeometry().setFromPoints(points));
    points = [];
  }

  const curAlt = getInterpolatedValue(times, ts, object.alt);
  const curAz = getInterpolatedValue(times, ts, object.az);
  const curPos = altAzToCartesian(curAlt, curAz, RADIUS);

  const color = COLORS[object.color.toLowerCase()];
  return (
    <>
      {lines.map((lineGeometry, i) => (
        <line key={`object-${object.name}-${i}`}>
          <lineBasicMaterial attach="material" color={color} />
          <primitive attach="geometry" object={lineGeometry} />
        </line>
      ))}
      <TextLabel text={object.name} position={longestMidPoint} color={color} />
      <mesh position={curPos} visible={curAlt > 0}>
        <sphereGeometry attach="geometry" args={[0.03, 32, 32]} />
        <meshBasicMaterial attach="material" color={color} />
      </mesh>
      <mesh ref={tracerMesh}>
        <sphereGeometry attach="geometry" args={[0.02, 32, 32]} />
        <meshBasicMaterial attach="material" color={color} />
      </mesh>
    </>
  );
};

const CameraControls = () => {
  const { camera, gl } = useThree();

  useEffect(() => {
    window.dragging = false;
    window.alt = 30;
    window.az = 0;

    const vector = altAzToCartesian(window.alt, window.az, RADIUS);
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
          Math.max(window.alt + deltaMove.y * 0.5, -89),
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
  }, [gl.domElement, camera]);

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
    <div style={{ height: "20rem", maxWidth: "40rem", margin: "auto" }}>
      <Canvas>
        <CameraSetter />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SphereGrid />
        <CameraControls />
        {objects.map((object) => (
          <ObjectPath key={object.name} object={object} times={times} />
        ))}
      </Canvas>
    </div>
  );
}
