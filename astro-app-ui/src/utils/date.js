import { DateTime } from "luxon";
import React from "react";
import { TIMEZONES } from "../constants/timezones";

export function renderTime(ts, tz) {
  const date = new Date(ts);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

export function renderDate(ts, tz) {
  const date = new Date(ts);
  // render with year
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: tz,
  });
}

export function renderTimeWithSeconds(ts, tz) {
  const date = new Date(ts);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: tz,
  });
}

export function renderTimeTill(nowTs, toTs) {
  const diff = toTs - nowTs;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor((diff / 60 / 60 / 1000) * 10) / 10;
  return `${hours} hours`;
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

export function idxContains(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] <= value && value < arr[i + 1]) {
      return i;
    }
  }
  return -1;
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
