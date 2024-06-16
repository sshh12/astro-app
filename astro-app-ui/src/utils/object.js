import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import Brightness5Icon from "@mui/icons-material/Brightness5";
import DensityLargeIcon from "@mui/icons-material/DensityLarge";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";

export function objectsToKey(objects) {
  if (objects) {
    const objectsSorted = objects.sort((a, b) => a.id - b.id);
    return objectsSorted.map((x) => x.id).join(",");
  } else {
    return "";
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

function objNamesToBadge(obj) {
  const prefixes = ["M ", "NGC ", "PGC ", "UGC ", "IC "];
  let name = "";
  for (let prefix of prefixes) {
    const nameWithPrefix = obj.names.find((n) => n.startsWith(prefix));
    if (nameWithPrefix) {
      name = nameWithPrefix;
      break;
    }
  }
  if (!name) {
    console.log(obj.names);
  }
  return name
    ? {
        text: name,
        color: "neutral",
      }
    : null;
}

function objTypeToBadge(obj) {
  let label;
  let color;
  if (obj.type === "SOLAR_SYSTEM_OBJECT") {
    label = "Solar System";
    color = "primary";
  } else if (obj.type === "STAR_OBJECT") {
    label = "Deep Space";
    color = "success";
  }
  return (
    label && {
      text: label,
      color: color,
    }
  );
}

function objAltToBadge(alt) {
  let color;
  let icon;
  if (alt < 0) {
    color = "danger";
    icon = SouthEastIcon;
  } else if (alt < 30) {
    color = "warning";
    icon = ArrowForwardIcon;
  } else {
    color = "success";
    icon = NorthEastIcon;
  }
  return {
    text: `${Math.round(alt)}°`,
    color: color,
    icon: icon,
  };
}

function objBrightnessToBadge(mag) {
  let color;
  let icon;
  if (mag < 0) {
    color = "success";
    icon = Brightness7Icon;
  } else if (mag < 6) {
    color = "warning";
    icon = Brightness6Icon;
  } else {
    color = "danger";
    icon = Brightness5Icon;
  }
  return { text: `${mag.toFixed(1)}`, color: color, icon: icon };
}

function objSizeToBadge(size) {
  let color;
  let icon;
  if (size > 30) {
    color = "success";
    icon = DensityLargeIcon;
  } else if (size > 1) {
    color = "warning";
    icon = DensityMediumIcon;
  } else {
    color = "danger";
    icon = DensitySmallIcon;
  }
  return { text: size.toFixed(1), color: color, icon: icon };
}

export const OBJECT_SORTS = [
  {
    id: "name",
    label: "name",
    sort: ({ a, b }) => a.name.localeCompare(b.name),
    badge: ({ obj }) => objNamesToBadge(obj),
  },
  {
    id: "type",
    label: "type",
    sort: ({ a, b }) => a.type.localeCompare(b.type),
    badge: ({ obj }) => objTypeToBadge(obj),
  },
  {
    id: "max-alt",
    label: "max altitude",
    sort: ({ a, b, orbits }) => {
      if (!orbits) return 0;
      const orbitAltA = orbits.objects[a.id].alt;
      const [maxAltA] = getMaxWhile(
        orbitAltA,
        (i) => orbits.time_state[i] > 0 && orbits.time_state[i] < 7
      );
      const orbitAltB = orbits.objects[b.id].alt;
      const [maxAltB] = getMaxWhile(
        orbitAltB,
        (i) => orbits.time_state[i] > 0 && orbits.time_state[i] < 7
      );
      return maxAltA - maxAltB;
    },
    badge: ({ obj, orbits }) => {
      if (!orbits) return null;
      const orbitAlt = orbits.objects[obj.id].alt;
      const [maxAlt] = getMaxWhile(
        orbitAlt,
        (i) => orbits.time_state[i] > 0 && orbits.time_state[i] < 7
      );
      return objAltToBadge(maxAlt);
    },
  },
  {
    id: "brightness",
    label: "brightness",
    sort: ({ a, b }) => {
      const magA = a.fluxV || 6.0;
      const magB = b.fluxV || 6.0;
      return magB - magA;
    },
    badge: ({ obj }) => obj.fluxV && objBrightnessToBadge(obj.fluxV),
  },
  {
    id: "size",
    label: "size",
    sort: ({ a, b }) => {
      const sizeA = a.sizeMajor || 1.0;
      const sizeB = b.sizeMajor || 1.0;
      return sizeA - sizeB;
    },
    badge: ({ obj }) => obj.sizeMajor && objSizeToBadge(obj.sizeMajor),
  },
];
