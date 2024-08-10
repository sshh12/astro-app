import { PhotoCamera } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";

function cameraTitle({
  teleName,
  teleFocalLength,
  camName,
  camWidth,
  camHeight,
  barlow,
  binning,
}) {
  const titleParts = [];
  if (teleName !== "Custom") {
    titleParts.push(`${teleName}`);
  } else {
    titleParts.push(`${teleFocalLength}mm`);
  }
  if (camName !== "Custom") {
    titleParts.push(`${camName}`);
  } else {
    titleParts.push(`${camWidth}x${camHeight}`);
  }
  if (barlow !== 1) {
    titleParts.push(`${barlow}x`);
  }
  if (binning !== 1) {
    titleParts.push(`${binning}x${binning}`);
  }
  return titleParts.join(" / ");
}

function visualTitle({
  teleName,
  teleFocalLength,
  eyeName,
  eyeFocalLength,
  barlow,
}) {
  const titleParts = [];
  if (teleName !== "Custom") {
    titleParts.push(`${teleName}`);
  } else {
    titleParts.push(`${teleFocalLength}mm`);
  }
  if (eyeName !== "Custom") {
    titleParts.push(`${eyeName}`);
  } else {
    titleParts.push(`${eyeFocalLength}mm`);
  }
  if (barlow !== 1) {
    titleParts.push(`${barlow}x`);
  }
  return titleParts.join(" / ");
}

function binoTitle({ binoName, binoMagnification }) {
  return `${binoName} / ${binoMagnification}x`;
}

export function equipmentToDetails(equipment) {
  const baseWidth = 1000;
  if (equipment && equipment.type === "CAMERA") {
    const effectiveFocalLength = equipment.teleFocalLength * equipment.barlow;
    const aspectRatio = equipment.camWidth / equipment.camHeight;
    const renderAspectRatio =
      equipment.camWidth > equipment.camHeight
        ? equipment.camWidth / equipment.camHeight
        : equipment.camHeight / equipment.camWidth;
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
      aspectRatio: aspectRatio,
      renderAspectRatio: renderAspectRatio,
      fov: Math.max(fovWidthDegrees, fovHeightDegrees),
      title: cameraTitle(equipment),
      icon: PhotoCamera,
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
      aspectRatio: 1,
      renderAspectRatio: 1,
      fov: tfov,
      title: visualTitle(equipment),
      icon: VisibilityIcon,
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
      aspectRatio: 1,
      renderAspectRatio: 1,
      fov: equipment.binoActualFOV,
      title: binoTitle(equipment),
      icon: SearchIcon,
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
      icon: SearchIcon,
      width: 1000,
      height: 1000,
      aspectRatio: 1,
      renderAspectRatio: 1,
      fov: 1.0,
      title: "Equipment",
      details: [],
    };
  }
}

export const EQUIP_MODES = [
  {
    mode: "VISUAL",
    label: "Visual",
    fields: [
      "barlow",
      "teleName",
      "teleFocalLength",
      "teleAperture",
      "eyeName",
      "eyeFocalLength",
      "eyeFOV",
    ],
    desc: "Fill in the fields below to add visual observing equipment. This is for people with a telescope and an eye piece.",
  },
  {
    mode: "CAMERA",
    label: "Camera",
    fields: [
      "barlow",
      "binning",
      "teleName",
      "teleFocalLength",
      "teleAperture",
      "camName",
      "camWidth",
      "camHeight",
      "camPixelWidth",
      "camPixelHeight",
    ],
    desc: "Fill in the fields below to add astrophotography equipment. This is for people with a telescope and a camera.",
  },
  {
    mode: "BINOCULARS",
    label: "Binoculars",
    fields: ["binoName", "binoAperture", "binoMagnification", "binoActualFOV"],
    desc: "Fill in the fields below to add binocular-based observing equipment.",
  },
];
