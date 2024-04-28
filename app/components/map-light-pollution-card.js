"use client";

import React from "react";
import { Card } from "@tremor/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapLightPollutionCard({ location }) {
  return (
    <Card>
      <MapContainer
        center={[location?.lat, location?.lon]}
        zoom={10}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        style={{ height: "50vh" }}
        onClick={(e) => console.log(e, e.latlng)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <TileLayer
          {...{
            minZoom: 2,
            maxNativeZoom: 8,
            maxZoom: 19,
            tileSize: 1024,
            zoomOffset: -2,
            opacity: 0.5,
          }}
          url="/lp/tiles/tile_{z}_{x}_{y}.png"
        />
        <Marker position={[location?.lat, location?.lon]}>
          <Popup keepInView={true}>{location?.name}</Popup>
        </Marker>
      </MapContainer>
    </Card>
  );
}
