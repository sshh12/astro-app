import { renderTime } from "./date";
import { yellow, grey, green, red } from "@mui/material/colors";
import Brightness1Icon from "@mui/icons-material/Brightness1";
import Brightness2Icon from "@mui/icons-material/Brightness2";
import Brightness3Icon from "@mui/icons-material/Brightness3";

const GOOD = "Good";
const WARN = "Warn";
const BAD = "Bad";

export function twilightToColor(value) {
  if (value === 4) {
    return grey[100];
  } else if (value === 3) {
    return grey[700];
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

export function cloudCoverToBadge({ cloudCover }) {
  let color;
  let state;
  if (cloudCover < 20) {
    color = green[700];
    state = GOOD;
  } else if (cloudCover < 80) {
    color = yellow[600];
    state = WARN;
  } else {
    color = red[800];
    state = BAD;
  }
  return {
    tooltip: `Clouds ${cloudCover}% at ${renderTime(0)}`,
    color: color,
    state: state,
  };
}

export function precipitationToBadge({ ts, precipitation }) {
  let color;
  let state;
  if (precipitation < 20) {
    color = green[700];
    state = GOOD;
  } else if (precipitation < 50) {
    color = yellow[600];
    state = WARN;
  } else {
    color = red[800];
    state = BAD;
  }
  return {
    tooltip: `Precipitation ${precipitation}% at ${renderTime(ts)}`,
    color: color,
    state: state,
  };
}

export function visibilityToBadge({ ts, visibility }) {
  let color;
  let state;
  if (visibility < 4000) {
    color = red[800];
    state = BAD;
  } else if (visibility < 10000) {
    color = yellow[600];
    state = WARN;
  } else {
    color = green[700];
    state = GOOD;
  }
  return {
    tooltip: `Visibility ${visibility} km at ${renderTime(ts)}`,
    color: color,
    state: state,
  };
}

export function moonPctToIcon(pct) {
  if (pct < 5) {
    return () => <Brightness1Icon style={{ color: grey[900] }} />;
  } else if (pct < 50) {
    return () => <Brightness3Icon style={{ color: grey[300] }} />;
  } else if (pct < 95) {
    return () => <Brightness2Icon style={{ color: grey[100] }} />;
  } else {
    return () => <Brightness1Icon style={{ color: grey[100] }} />;
  }
}

export function summaryToBadge({
  ts,
  twilightState,
  cloudCover,
  precipitation,
  visibility,
}) {
  if (twilightState > 1) {
    return {
      tooltip: `${getTwlightName(twilightState)} at ${renderTime(ts)}`,
      color: grey[900],
    };
  }
  const badges = [
    cloudCoverToBadge({ ts, cloudCover }),
    precipitationToBadge({ ts, precipitation }),
    visibilityToBadge({ ts, visibility }),
  ];
  for (let badge of badges) {
    if (badge.state === BAD) {
      return badge;
    }
  }
  for (let badge of badges) {
    if (badge.state === WARN) {
      return badge;
    }
  }
  return {
    tooltip: `Great observing at ${renderTime(ts)}`,
    color: green[700],
  };
}
