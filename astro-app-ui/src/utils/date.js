import React from "react";
import { DateTime } from "luxon";
import { TIMEZONES } from "../constants/timezones";

export function renderTime(ts, tz) {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

export function renderTimeWithSeconds(ts, tz) {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: tz,
  });
}

export function useTimestamp({ updateInterval } = {}) {
  const interval = updateInterval || 1000;
  const [ts, setTs] = React.useState(+Date.now());
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setTs(+Date.now());
    }, interval);
    return () => clearInterval(intervalId);
  }, [interval]);
  return { ts };
}

export function minMaxIdx(arr, value) {
  const first = arr.indexOf(value);
  const last = arr.lastIndexOf(value);
  return [first, last];
}

export function useCurrentObservingWindow(tz) {
  const now = DateTime.now().setZone(tz);
  const noon = now.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

  if (now.hour >= 12) {
    const tomorrow = now
      .plus({ days: 1 })
      .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
    return [noon.toMillis(), tomorrow.toMillis()];
  } else {
    const yesterday = now
      .minus({ days: 1 })
      .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
    return [yesterday.toMillis(), noon.toMillis()];
  }
}

export function getSystemTimeZone() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzExists = TIMEZONES.find((t) => t.name === tz);
  return tzExists ? tz : "UTC";
}
