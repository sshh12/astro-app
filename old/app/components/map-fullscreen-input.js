"use client";

import React, { useEffect, useRef, useState } from "react";
import { Flex, Dialog, DialogPanel, Button } from "@tremor/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapFullScreenDialog({ open, setOpen, setLocation }) {
  const [markerPos, setMarkerPos] = useState([0, 0]);
  const mapRef = useRef();
  useEffect(() => {
    const fixInterval = setInterval(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
    return () => clearInterval(fixInterval);
  }, [mapRef]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        setMarkerPos([center.lat, center.lng]);
        setLocation([center.lat, center.lng]);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [mapRef, setLocation]);
  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        if (mapRef.current && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              mapRef.current.setView(
                [position.coords.latitude, position.coords.longitude],
                13
              );
            },
            (error) => console.log(error)
          );
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [open, mapRef]);
  return (
    <Dialog open={open} onClose={() => setOpen(false)} static={true}>
      <DialogPanel style={{ height: "calc(88vh+1rem)" }} className="p-1">
        <MapContainer
          center={[0, 0]}
          zoom={4}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          style={{ height: "88vh" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={markerPos}>
            <Popup keepInView={true}>Move the map to set location</Popup>
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
