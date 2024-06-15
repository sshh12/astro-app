import React from "react";

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
