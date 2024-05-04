import React, { useEffect, useRef, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { COLORS } from "../colors";
import {
  useTimestamp,
  getInterpolatedValue,
  formatTime,
  formatDate,
} from "../utils";

const RADIUS = 2;
const TRACER_OFFSET = 1000 * 60 * 60 * 2;

export const altAzToCartesian = (alt, az, radius = RADIUS) => {
  const phi = THREE.MathUtils.degToRad(90 - alt);
  const theta = THREE.MathUtils.degToRad(az);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const TextMark = ({ text, position, fontSize = 100 }) => {
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 100;
    canvas.height = 100;
    context.font = `bold ${fontSize}px serif`;
    context.fillStyle = "#3b82f6";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [text, fontSize]);

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
        opacity={1.0}
      />
    </mesh>
  );
};

const TextObjectLabel = ({ text, position, color }) => {
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
      <planeGeometry attach="geometry" args={[0.1 * width, 0.1]} />
      <meshBasicMaterial
        attach="material"
        map={canvasTexture}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
};

const TextTimeLabel = ({ text, position, color }) => {
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
    context.lineWidth = 20;
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
      <planeGeometry attach="geometry" args={[0.04 * width, 0.04]} />
      <meshBasicMaterial
        attach="material"
        map={canvasTexture}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
};

export const SphereGrid = () => {
  const altLines = useMemo(() => {
    const lines = [];
    for (let alt = -90; alt <= 90; alt += 30) {
      const points = [];
      for (let az = 0; az <= 360; az += 5) {
        points.push(altAzToCartesian(alt, az, RADIUS));
      }
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const opacity = alt === 0 ? 1 : 0.5;
      const lineWidth = alt === 0 ? 2 : 1;
      lines.push(
        <line key={`alt-${alt}`}>
          <lineBasicMaterial
            attach="material"
            color="white"
            transparent={true}
            opacity={opacity}
            linewidth={lineWidth}
          />
          <primitive attach="geometry" object={lineGeometry} />
        </line>
      );
    }
    return lines;
  }, []);

  const azLines = useMemo(() => {
    const lines = [];
    for (let az = 0; az <= 360; az += 30) {
      const points = [];
      for (let alt = -90; alt <= 90; alt += 5) {
        points.push(altAzToCartesian(alt, az, 2));
      }
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(
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
    return lines;
  }, []);

  const markPos = useMemo(() => {
    const marks = [
      { label: "N", pos: altAzToCartesian(0, 0, RADIUS - 0.1), fontSize: 100 },
      {
        label: "S",
        pos: altAzToCartesian(180, 0, RADIUS - 0.1),
        fontSize: 100,
      },
      { label: "E", pos: altAzToCartesian(0, 90, RADIUS - 0.1), fontSize: 100 },
      {
        label: "W",
        pos: altAzToCartesian(0, 270, RADIUS - 0.1),
        fontSize: 100,
      },
      { label: "NE", pos: altAzToCartesian(0, 45, RADIUS - 0.1), fontSize: 50 },
      {
        label: "NW",
        pos: altAzToCartesian(0, 315, RADIUS - 0.1),
        fontSize: 50,
      },
      {
        label: "SE",
        pos: altAzToCartesian(0, 135, RADIUS - 0.1),
        fontSize: 50,
      },
      {
        label: "SW",
        pos: altAzToCartesian(0, 225, RADIUS - 0.1),
        fontSize: 50,
      },
    ];
    return marks;
  }, []);

  const origin = new THREE.Vector3(0, 0, 0);

  return (
    <>
      {altLines}
      {azLines}
      {markPos.map((mark, i) => (
        <TextMark
          key={`mark-${i}`}
          text={mark.label}
          position={mark.pos}
          fontSize={mark.fontSize}
        />
      ))}
      <mesh position={origin}>
        <sphereGeometry
          attach="geometry"
          args={[RADIUS * 1.9, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI]}
        />
        <meshBasicMaterial
          attach="material"
          color={"#1c2424"}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={origin}>
        <sphereGeometry attach="geometry" args={[RADIUS * 2, 32, 32]} />
        <meshBasicMaterial
          attach="material"
          color={"#242d2e"}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export const ObjectPoint = ({ object, az, alt }) => {
  const curPos = altAzToCartesian(alt, az, RADIUS);
  const curPosText = altAzToCartesian(alt + 6, az, RADIUS);
  const color = COLORS[object.color.toLowerCase()];

  return (
    <>
      <TextObjectLabel text={object.name} position={curPosText} color={color} />
      <mesh position={curPos}>
        <sphereGeometry attach="geometry" args={[0.04, 32, 32]} />
        <meshBasicMaterial attach="material" color={color} />
      </mesh>
    </>
  );
};

export const HourCheckpoints = ({ object, times, timezone }) => {
  const checkpointElements = useMemo(() => {
    const wholeHours = [
      ...new Set(
        times.map((ts) => {
          const date = new Date(ts);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
          return +date;
        })
      ),
    ];
    return wholeHours
      .filter((ts) => ts >= times[0] && ts <= times[times.length - 1])
      .map((ts) => {
        const curAlt = getInterpolatedValue(times, ts, object.alt);
        const curAz = getInterpolatedValue(times, ts, object.az);
        const curPos = altAzToCartesian(curAlt, curAz);
        return (
          <TextTimeLabel
            key={`checkpoint-${ts}`}
            text={formatTime(ts, timezone, true)}
            position={curPos}
            color={COLORS[object.color.toLowerCase()]}
          />
        );
      });
  }, [object, times, timezone]);

  return <>{checkpointElements}</>;
};

export const ObjectPath = ({
  object,
  times,
  timezone,
  showHourCheckpoints,
}) => {
  const { ts } = useTimestamp();
  const tracerMesh = useRef();
  const tracerOffset = useRef(0);
  const tsIsInBounds = ts >= times[0] && ts <= times[times.length - 1];
  const curAlt = getInterpolatedValue(times, ts, object.alt);
  const curAz = getInterpolatedValue(times, ts, object.az);
  const curPos = altAzToCartesian(curAlt, curAz);

  useFrame(() => {
    if (!tracerMesh.current) return;
    const ts = +Date.now();
    const tsOffset = ts + tracerOffset.current;
    const inbounds =
      tsOffset >= times[0] && tsOffset <= times[times.length - 1];
    if (!inbounds) {
      tracerMesh.current.visible = false;
      return;
    }
    const altTracer = getInterpolatedValue(times, tsOffset, object.alt);
    const azTracer = getInterpolatedValue(times, tsOffset, object.az);
    const posTracer = altAzToCartesian(altTracer, azTracer);
    tracerMesh.current.position.x = posTracer.x;
    tracerMesh.current.position.y = posTracer.y;
    tracerMesh.current.position.z = posTracer.z;
    tracerOffset.current += 1000 * 60;
    if (tracerOffset.current > TRACER_OFFSET) {
      tracerOffset.current = 0;
    }
    tracerMesh.current.visible = true;
  });

  const points = [];
  for (let i in object.az) {
    points.push(altAzToCartesian(object.alt[i], object.az[i]));
  }
  const orbitLine = new THREE.BufferGeometry().setFromPoints(points);
  const midpointIdx = Math.floor(points.length / 2);
  const labelPoint = altAzToCartesian(
    object.alt[midpointIdx],
    object.az[midpointIdx],
    RADIUS - 0.1
  );

  const color = COLORS[object.color.toLowerCase()];
  return (
    <>
      {showHourCheckpoints && (
        <HourCheckpoints object={object} times={times} timezone={timezone} />
      )}
      <line>
        <lineBasicMaterial attach="material" color={color} />
        <primitive attach="geometry" object={orbitLine} />
      </line>
      <TextObjectLabel text={object.name} position={labelPoint} color={color} />
      <mesh position={curPos} visible={tsIsInBounds}>
        <sphereGeometry attach="geometry" args={[0.03, 32, 32]} />
        <meshBasicMaterial attach="material" color={color} />
      </mesh>
      <mesh ref={tracerMesh}>
        <sphereGeometry attach="geometry" args={[0.005, 32, 32]} />
        <meshBasicMaterial attach="material" color={color} />
      </mesh>
    </>
  );
};

export const MonthlyCheckpoints = ({ days, timezone }) => {
  const checkpointElements = useMemo(() => {
    const dayCheckpoints = days.filter((day) => {
      const dateFormatted = formatDate(day.start, timezone);
      const regex = /(\d{1,2})\/(1|15)\/\d{4}/;
      return regex.test(dateFormatted);
    });
    return dayCheckpoints.map((day) => {
      const curPos = altAzToCartesian(day.max_alt, day.az_at_max_alt);
      return (
        <TextTimeLabel
          key={`checkpoint-${day.start}`}
          text={formatDate(day.start, timezone)}
          position={curPos}
          color={"#eeeeee"}
        />
      );
    });
  }, [days]);
  return <>{checkpointElements}</>;
};

export const LongTermPath = ({ longTermDays, timezone }) => {
  const maxAltPoints = [];
  for (let day of longTermDays) {
    maxAltPoints.push(altAzToCartesian(day.max_alt, day.az_at_max_alt));
  }
  const maxAltLine = new THREE.BufferGeometry().setFromPoints(maxAltPoints);
  return (
    <>
      <MonthlyCheckpoints days={longTermDays} timezone={timezone} />
      <line>
        <lineBasicMaterial attach="material" color={"#3b82f6"} />
        <primitive attach="geometry" object={maxAltLine} />
      </line>
    </>
  );
};

export const CameraControls = ({ startAlt = 30, startAz = 0 }) => {
  const { camera, gl } = useThree();
  const draggingRef = useRef(false);
  const prevTapRef = useRef({ x: 0, y: 0 });
  const lookRef = useRef({ alt: startAlt, az: startAz });

  useEffect(() => {
    const vector = altAzToCartesian(lookRef.current.alt, lookRef.current.az);
    camera.lookAt(vector);

    const onMouseDown = (event) => {
      event.preventDefault();
      draggingRef.current = true;
      prevTapRef.current = !event.touches
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
      if (draggingRef.current) {
        event.preventDefault();
        const deltaMove = !event.touches
          ? {
              x: event.clientX - prevTapRef.current.x,
              y: event.clientY - prevTapRef.current.y,
            }
          : {
              x: event.touches[0].clientX - prevTapRef.current.x,
              y: event.touches[0].clientY - prevTapRef.current.y,
            };

        lookRef.current.alt = Math.min(
          Math.max(lookRef.current.alt + deltaMove.y * 0.5, -89),
          89
        );
        lookRef.current.az -= deltaMove.x * 0.5;

        const vector = altAzToCartesian(
          lookRef.current.alt,
          lookRef.current.az
        );
        camera.lookAt(vector);

        prevTapRef.current = !event.touches
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
      draggingRef.current = false;
    };

    gl.domElement.addEventListener("mousedown", onMouseDown);
    gl.domElement.addEventListener("mousemove", onMouseMove);
    gl.domElement.addEventListener("mouseup", onMouseUp);
    gl.domElement.addEventListener("touchstart", onMouseDown);
    gl.domElement.addEventListener("touchmove", onMouseMove);
    gl.domElement.addEventListener("touchend", onMouseUp);

    const onDeviceOrientation = (event) => {
      console.log(
        "onDeviceOrientation",
        event.alpha,
        event.beta,
        event.gamma,
        event.absolute
      );
      if (
        event.alpha === null ||
        event.beta === null ||
        event.gamma === null ||
        !event.absolute
      )
        return;
      // const alpha = THREE.MathUtils.degToRad(event.alpha);
      // const beta = THREE.MathUtils.degToRad(event.beta);
      // const gamma = THREE.MathUtils.degToRad(event.gamma);
      // camera.rotation.set(beta, gamma, alpha);
    };

    window.addEventListener(
      "deviceorientationabsolute",
      onDeviceOrientation,
      true
    );

    return () => {
      gl.domElement.removeEventListener("mousedown", onMouseDown);
      gl.domElement.removeEventListener("mousemove", onMouseMove);
      gl.domElement.removeEventListener("mouseup", onMouseUp);
      gl.domElement.removeEventListener("touchstart", onMouseDown);
      gl.domElement.removeEventListener("touchmove", onMouseMove);
      gl.domElement.removeEventListener("touchend", onMouseUp);
      window.removeEventListener(
        "deviceorientationabsolute",
        onDeviceOrientation
      );
    };
  }, [gl.domElement, camera, lookRef, draggingRef, prevTapRef]);

  return null;
};

export function CameraSetter() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.01, 0);
  }, [camera]);

  return null;
}
