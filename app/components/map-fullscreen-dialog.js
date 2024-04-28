"use client";

import React, { useEffect, useRef } from "react";
import { Flex, Dialog, DialogPanel, Button } from "@tremor/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapFullScreenDialog({
  open,
  setOpen,
  lat,
  lon,
  popupTitle,
}) {
  const mapRef = useRef();
  useEffect(() => {
    const fixInterval = setInterval(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
    return () => clearInterval(fixInterval);
  }, [mapRef]);
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      static={true}
      style={{ zIndex: 999999 }}
    >
      <DialogPanel
        style={{ height: "calc(88vh+1rem)", width: "1000px !important" }}
        className="p-1"
      >
        <MapContainer
          center={[lat, lon]}
          zoom={5}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          style={{ height: "88vh" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lon]}>
            <Popup keepInView={true}>{popupTitle}</Popup>
          </Marker>
        </MapContainer>
        <Flex className="mt-3 justify-center p-3">
          <Button variant="light" onClick={() => setOpen(false)} color="slate">
            Close
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
