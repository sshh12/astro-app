export function equipmentToDetails(equipment) {
  const baseWidth = 1000;
  if (equipment && equipment.type === "CAMERA") {
    const effectiveFocalLength = equipment.teleFocalLength * equipment.barlow;
    const aspectRatio = equipment.camWidth / equipment.camHeight;
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
      fov: Math.max(fovWidthDegrees, fovHeightDegrees),
      titleRows: [
        `${equipment.teleName} (${equipment.teleFocalLength}mm)`,
        equipment.camName,
        `${equipment.barlow}x`,
      ],
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
      aspectRatio: 1,
      fov: tfov,
      titleRows: [
        `${equipment.teleName} (${equipment.teleFocalLength}mm)`,
        `${equipment.eyeName} (${equipment.eyeFocalLength}mm)`,
        `${equipment.barlow}x`,
      ],
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
      aspectRatio: 1,
      fov: equipment.binoActualFOV,
      titleRows: [equipment.binoName],
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
      aspectRatio: 1,
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
