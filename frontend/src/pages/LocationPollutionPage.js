import {
  Box,
  Card,
  Divider,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Stack,
  Typography,
} from "@mui/joy";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import BaseLocationPage from "../components/BaseLocationPage";
import { useBackend } from "../providers/backend";
import { useStorage } from "../providers/storage";
import {
  CURRENT_ICON,
  fetchLPData,
  getDeviceLocation,
  getLPDetails,
} from "../utils/pos";

function useLPData({ location }) {
  const { cacheStore } = useStorage();
  const [lpData, setLPData] = useState(null);
  const [lpDetails, setLPDetails] = useState(null);
  useEffect(() => {
    if (location && cacheStore) {
      (async () => {
        const data = await fetchLPData(location, cacheStore);
        setLPData(data);
        setLPDetails(getLPDetails({ skyBrightness: data.mpsas }));
      })();
    }
  }, [location, cacheStore]);
  return { lpData, lpDetails };
}

function SkyQualityCard({ location }) {
  const { lpData, lpDetails } = useLPData({ location });
  const details = [];
  if (lpData && lpDetails) {
    details.push({
      name: "Bortle",
      value: `Class ${lpDetails.bortle}`,
    });
    details.push({
      name: "Naked-Eye Limit (NELM)",
      value: lpDetails.nelmApprox.toFixed(1),
    });
    details.push({
      name: "Sky Brightness (SQM)",
      value: `${lpData.mpsas.toFixed(2)} mag/arcsec^2`,
    });
    details.push({
      name: "Artifical Ratio",
      value: `${lpData.brightnessRatio.toFixed(2)} x`,
    });
  }
  return (
    <Card sx={{ p: 0, gap: 0 }}>
      <Box sx={{ mb: 2, pt: 2, px: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Sky Quality</Typography>
        </Stack>
      </Box>
      <Divider />
      <List>
        {details.map((d, idx) => (
          <>
            <ListItem>
              <ListItemContent>
                <Typography level="body-sm" fontWeight="lg">
                  {d.name}
                </Typography>
              </ListItemContent>
              <Typography level="body-sm">{d.value}</Typography>
            </ListItem>
            {idx < details.length - 1 && <ListDivider />}
          </>
        ))}
      </List>
      <Divider />
      <Box sx={{ padding: 1.5 }}>
        {lpDetails && (
          <Typography level="body-sm">
            <i>{lpDetails.recommendations}</i>
          </Typography>
        )}
      </Box>
    </Card>
  );
}

function LightPollutionMap({ location }) {
  const mapRef = useRef();
  const [curLocation, setCurLocation] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const loc = await getDeviceLocation();
        setCurLocation(loc);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  useEffect(() => {
    const fixInterval = setInterval(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
    return () => clearInterval(fixInterval);
  }, [mapRef]);
  if (!location) return <></>;
  return (
    <MapContainer
      zoom={10}
      center={[location.lat, location.lon]}
      scrollWheelZoom={true}
      doubleClickZoom={false}
      style={{ height: "50vh" }}
      ref={mapRef}
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
      {curLocation && (
        <Marker
          position={[curLocation?.lat, curLocation?.lon]}
          icon={CURRENT_ICON}
        >
          <Popup>Current Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

function LightPollutionMapCard({ location }) {
  return (
    <Card sx={{ p: 0, gap: 0 }}>
      <Box sx={{ mb: 2, pt: 2, px: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Light Pollution</Typography>
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ padding: 0 }}>
        <LightPollutionMap location={location} />
      </Box>
    </Card>
  );
}

export default function LocationPollutionPage() {
  const { location } = useBackend();
  return (
    <BaseLocationPage tabIdx={1}>
      <SkyQualityCard location={location} />
      <LightPollutionMapCard location={location} />
    </BaseLocationPage>
  );
}
