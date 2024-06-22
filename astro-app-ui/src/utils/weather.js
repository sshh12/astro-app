import { yellow, grey, green, red } from "@mui/material/colors";
import CircleIcon from "@mui/icons-material/Circle";

export function twilightToColor(value) {
  if (value === 4) {
    return yellow[600];
  } else if (value === 3) {
    return yellow[700];
  } else if (value === 2) {
    return grey[600];
  } else {
    return grey[900];
  }
}

export function getTwlightName(value) {
  return {
    0: "Night",
    1: "Astronomical twilight",
    2: "Nautical twilight",
    3: "Civil twilight",
    4: "Day",
  }[value];
}

export function cloudCoverToColor(cloudCover) {
  if (cloudCover < 20) {
    return green[700];
  } else if (cloudCover < 80) {
    return yellow[600];
  } else {
    return red[800];
  }
}

export function precipitationToColor(precipitation) {
  if (precipitation < 20) {
    return green[700];
  } else if (precipitation < 50) {
    return yellow[600];
  } else {
    return red[800];
  }
}

export function visabilityToColor(visability) {
  if (visability < 4000) {
    return red[800];
  } else if (visability < 10000) {
    return yellow[600];
  } else {
    return green[700];
  }
}

export function moonPctToIcon(pct) {
  return () => <CircleIcon style={{ color: grey[900] }} />;
}
