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
  return max;
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
