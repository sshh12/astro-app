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

export function objectSize(object) {
  const major = object.sizeMajor;
  const minor = object.sizeMinor;
  if (major > 1) {
    return `${major.toFixed(2)}′ × ${minor.toFixed(2)}′`;
  } else {
    return `${(major * 60).toFixed(2)}″ × ${(minor * 60).toFixed(2)}″`;
  }
}
