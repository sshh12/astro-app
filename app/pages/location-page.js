"use client";

import React from "react";
import { Card } from "@tremor/react";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";

export default function LocationPage() {
  const { ready, user } = useAPI();

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Location"
        subtitle={user ? `${user.lat.toFixed(2)}, ${user.lon.toFixed(2)}` : ""}
        loading={!ready}
      />

      {user && (
        <iframe
          style={{ width: "100%", height: "80vh" }}
          src={`https://clearoutside.com/forecast/${user.lat}/${user.lon}`}
        ></iframe>
      )}
    </div>
  );
}
