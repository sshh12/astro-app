"use client";

import { useEffect, useState, useRef } from "react";

export default function LoadingBar({ loading, color }) {
  const loadingInterval = useRef(null);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (loading) {
      loadingInterval.current = setInterval(() => {
        setPct((pct) => {
          pct += 1;
          return pct;
        });
      }, 100);
    } else if (!loading && loadingInterval.current) {
      clearInterval(loadingInterval.current);
      loadingInterval.current = null;
      setPct(0);
    }
    return () => {
      if (loadingInterval.current) {
        clearInterval(loadingInterval.current);
      }
    };
  }, [loading]);
  const brightness = Math.abs(Math.sin(pct / 3)) * 0.9 + 0.1;
  return (
    <div
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        height: "2px",
        background: "transparent",
        zIndex: "2147483647",
        width: "100%",
        opacity: loading ? brightness : 0,
        transition: "all 100ms ease 0s",
      }}
    >
      <div
        style={{
          height: "100%",
          background: color,
          width: "100%",
          position: "absolute",
          left: `0%`,
          opacity: "1",
          color: color,
        }}
      ></div>
      <div
        style={{
          boxShadow: `${color} 0px 0px 5px, ${color} 0px 0px 5px`,
          width: "100%",
          opacity: "1",
          position: "absolute",
          height: "100%",
        }}
      ></div>
    </div>
  );
}
