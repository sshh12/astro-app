import { useState, useEffect } from "react";

export function minMaxIdx(arr, value) {
  let first = arr.indexOf(value);
  let last = arr.lastIndexOf(value);
  return [first, last];
}

export function getInterpolatedValue(arr, value, values) {
  let i = arr.findIndex((x) => x > value);
  if (i === 0) {
    return values[0];
  } else if (i === arr.length) {
    return values[arr.length - 1];
  } else {
    let x0 = arr[i - 1];
    let x1 = arr[i];
    let y0 = values[i - 1];
    let y1 = values[i];
    return y0 + ((value - x0) * (y1 - y0)) / (x1 - x0);
  }
}

export function getMaxWhile(arr, whileFunc) {
  let max = -Infinity;
  let maxIdx = -1;
  for (let i = 0; i < arr.length; i++) {
    if (whileFunc(i) && arr[i] > max) {
      max = arr[i];
      maxIdx = i;
    }
  }
  return [max, maxIdx];
}

export function useTimestamp() {
  const [ts, setTs] = useState(+Date.now());
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTs(+Date.now());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  return { ts };
}

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function formatTime(ts, timezone, trimSeconds = false) {
  let timeString = new Date(ts).toLocaleTimeString("en-US", {
    timeZone: timezone || "UTC",
  });
  if (trimSeconds) {
    timeString = timeString.replace(/:\d+ ([APM]+)/, " $1");
  }
  return timeString;
}

export function objectAKA(object) {
  const NGC = object.names.find((x) => x.startsWith("NGC "));
  const M = object.names.find((x) => x.startsWith("M "));
  const PGC = object.names.find((x) => x.startsWith("PGC "));
  const UGC = object.names.find((x) => x.startsWith("UGC "));
  const IC = object.names.find((x) => x.startsWith("IC "));

  let names = object.names
    .filter(
      (x) =>
        x.startsWith("NAME ") &&
        !object.name.toLowerCase().includes(x.toLowerCase()) &&
        !x.toLowerCase().includes(object.name.toLowerCase())
    )
    .map((x) => x.slice(5));
  const nebulaNames = names
    .filter((x) => x.endsWith(" Nebula"))
    .sort((a, b) => b.length - a.length);
  names = names
    .filter((x) => !nebulaNames.includes(x))
    .concat([nebulaNames[0]])
    .filter((x) => x && x.trim() !== "");

  let aka = [...names];
  for (let val of [M, NGC, PGC, UGC, IC]) {
    if (val) {
      aka.push(val);
    }
  }
  return aka;
}

export function formatLocation(lat, lon, sep = ", ") {
  let latFormat = lat.toFixed(2);
  if (lat < 0) {
    latFormat = (-latFormat).toFixed(2) + " S";
  } else {
    latFormat += " N";
  }
  let lonFormat = lon.toFixed(2);
  if (lon < 0) {
    lonFormat = (-lonFormat).toFixed(2) + " W";
  } else {
    lonFormat += " E";
  }
  return `${latFormat}${sep}${lonFormat}`;
}

export function objectSize(object) {
  const major = object.sizeMajor;
  const minor = object.sizeMinor;
  if (major > 1) {
    return `${major.toFixed(2)}′ × ${minor.toFixed(2)}′`;
  } else {
    return `${(major * 60).toFixed(2)}″ × ${(minor * 60).toFixed(2)}″`;
  }
}

export function equipmentToDimensions(equipment) {
  const baseWidth = 1000;
  if (equipment && equipment.type === "CAMERA") {
    const effectiveFocalLength = equipment.teleFocalLength * equipment.barlow;
    const aspectRatio = equipment.camHeight / equipment.camWidth;
    const height = Math.round(aspectRatio * baseWidth);
    const sensorWidthMM = equipment.camWidth * (equipment.camPixelWidth / 1000);
    const sensorHeightMM =
      equipment.camHeight * (equipment.camPixelHeight / 1000);
    const fovWidthDegrees =
      ((sensorWidthMM / effectiveFocalLength) * (180 / Math.PI)) /
      equipment.binning;
    const fovHeightDegrees =
      ((sensorHeightMM / effectiveFocalLength) * (180 / Math.PI)) /
      equipment.binning;
    const renderWidth = baseWidth > height ? baseWidth : height;
    const renderHeight = baseWidth > height ? height : baseWidth;
    const focalRatio = effectiveFocalLength / equipment.teleAperture;
    return {
      width: renderWidth,
      height: renderHeight,
      fov: Math.max(fovWidthDegrees, fovHeightDegrees),
      title: `${equipment.teleName} (${equipment.teleFocalLength}mm) / ${equipment.camName} (${equipment.camHeight}x${equipment.camWidth}) / ${equipment.barlow}x / ${equipment.binning}x${equipment.binning}`,
      details: [
        {
          name: "Aperture",
          value: `${equipment.teleAperture.toFixed(2)} mm`,
        },
        {
          name: "Focal Length",
          value: `${effectiveFocalLength.toFixed(2)} mm`,
        },
        {
          name: "Max Magnification",
          value: `${Math.min(2.5 * equipment.teleAperture, 350).toFixed(2)}x`,
        },
        {
          name: "Field of View",
          value: `${fovWidthDegrees.toFixed(2)}° × ${fovHeightDegrees.toFixed(
            2
          )}°`,
        },
        {
          name: "Focal Ratio",
          value: `${focalRatio.toFixed(2)}`,
        },
        {
          name: "Dawes' Limit",
          value: `${(116 / equipment.teleAperture).toFixed(2)} arcsecs`,
        },
        {
          name: "Rayleigh Limit",
          value: `${(138 / equipment.teleAperture).toFixed(2)} arcsecs`,
        },
        {
          name: "Limiting Magnitude",
          value: `${(
            7.7 +
            (5 * Math.log(equipment.teleAperture / 10)) / Math.LN10
          ).toFixed(2)}`,
        },
        {
          name: "Human Eye Light Grasp",
          value: `${(
            Math.pow(equipment.teleAperture, 2) / Math.pow(7, 2)
          ).toFixed(2)}x`,
        },
        {
          name: "Arc Resolution",
          value: `${(
            (equipment.camPixelWidth / effectiveFocalLength) *
            206.265 *
            equipment.binning
          ).toFixed(2)} arcsecs/px`,
        },
        {
          name: "Pixel Size",
          value: `${equipment.camPixelWidth.toFixed(
            2
          )} µm x ${equipment.camPixelHeight.toFixed(2)} µm`,
        },
        {
          name: "Pixel Resolution",
          value: `${equipment.camHeight / equipment.binning} px x ${
            equipment.camWidth / equipment.binning
          } px (${(
            ((equipment.camHeight / equipment.binning) *
              (equipment.camWidth / equipment.binning)) /
            1000000
          ).toFixed(2)} MP)`,
        },
        {
          name: "Max Untracked Exposure (NPF)",
          value: `${(
            (1.0 *
              (16.856 * focalRatio +
                0.0997 * effectiveFocalLength +
                13.713 * equipment.camPixelWidth)) /
            (effectiveFocalLength * Math.cos(0))
          ).toFixed(2)}s`,
        },
        {
          name: "Max Untracked Exposure (Plate Scale)",
          value: `${(
            (206265 * (equipment.camPixelWidth / 1000)) /
            effectiveFocalLength /
            15
          ).toFixed(2)}s`,
        },
      ],
    };
  } else if (equipment && equipment.type === "VISUAL") {
    const effectiveFocalLength = equipment.teleFocalLength * equipment.barlow;
    const magnification = effectiveFocalLength / equipment.eyeFocalLength;
    const tfov = equipment.eyeFOV / magnification;
    return {
      width: 1000,
      height: 1000,
      fov: tfov,
      title: `${equipment.teleName} (${equipment.teleFocalLength}mm) / ${equipment.eyeName} (${equipment.eyeFocalLength}mm) / ${equipment.barlow}x / ${equipment.binning}x${equipment.binning}`,
      details: [
        {
          name: "Aperture",
          value: `${equipment.teleAperture.toFixed(2)} mm`,
        },
        {
          name: "Focal Length",
          value: `${effectiveFocalLength.toFixed(2)} mm`,
        },
        {
          name: "Magnification",
          value: `${magnification.toFixed(2)}x`,
        },
        {
          name: "Max Magnification",
          value: `${Math.min(2.5 * equipment.teleAperture, 350).toFixed(2)}x`,
        },
        {
          name: "Field of View",
          value: `${tfov.toFixed(2)}°`,
        },
        {
          name: "Focal Ratio",
          value: `${(effectiveFocalLength / equipment.teleAperture).toFixed(
            2
          )}`,
        },
        {
          name: "Dawes' Limit",
          value: `${(116 / equipment.teleAperture).toFixed(2)} arcsecs`,
        },
        {
          name: "Rayleigh Limit",
          value: `${(138 / equipment.teleAperture).toFixed(2)} arcsecs`,
        },
        {
          name: "Human Eye Light Grasp",
          value: `${(
            Math.pow(equipment.teleAperture, 2) / Math.pow(7, 2)
          ).toFixed(2)}x`,
        },
      ],
    };
  } else if (equipment && equipment.type === "BINOCULARS") {
    return {
      width: 1000,
      height: 1000,
      fov: equipment.binoActualFOV,
      title: `${equipment.binoName} (${equipment.binoMagnification}x)`,
      details: [
        {
          name: "Field of View",
          value: `${equipment.binoActualFOV.toFixed(2)}°`,
        },
        {
          name: "Real Field of View @ 1000m",
          value: `${(
            Math.tan(equipment.binoActualFOV * (Math.PI / 180)) * 1000
          ).toFixed(2)} m`,
        },
      ],
    };
  } else {
    return {
      width: 1000,
      height: 1000,
      fov: 1.0,
      title: "Equipment",
      details: [],
    };
  }
}
