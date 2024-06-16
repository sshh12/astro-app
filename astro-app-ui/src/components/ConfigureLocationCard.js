import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Stack,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
} from "@mui/joy";
import ConfigureTabsCard, { ConfigureTabPanel } from "./ConfigureTabsCard";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { getDeviceLocation } from "../utils/pos";
import LandscapeIcon from "@mui/icons-material/Landscape";
import { TIMEZONES } from "../constants/timezones";

function getDefaultTimeZone() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzExists = TIMEZONES.find((t) => t.name === tz);
  return tzExists ? tz : "UTC";
}

function ConfigureLocationManually({ editPos, setEditPos }) {
  const defaultTz = useMemo(() => getDefaultTimeZone(), []);
  return (
    <Stack spacing={2} sx={{ flexGrow: 1 }}>
      <Stack spacing={1}>
        <FormLabel>Name</FormLabel>
        <FormControl
          sx={{ display: { sm: "flex-column", md: "flex-row" }, gap: 2 }}
        >
          <Input
            size="sm"
            placeholder="Nickname"
            value={editPos.name}
            onChange={(e) => setEditPos({ ...editPos, name: e.target.value })}
          />
        </FormControl>
      </Stack>
      <Stack spacing={1}>
        <FormLabel>Geographic Location</FormLabel>
        <FormControl
          sx={{ display: { sm: "flex-column", md: "flex-row" }, gap: 2 }}
        >
          <Input
            size="sm"
            placeholder="Latitude"
            type="number"
            value={editPos.lat}
            onChange={(e) => setEditPos({ ...editPos, lat: e.target.value })}
          />
        </FormControl>
        <FormControl
          sx={{ display: { sm: "flex-column", md: "flex-row" }, gap: 2 }}
        >
          <Input
            size="sm"
            placeholder="Longitude"
            type="number"
            value={editPos.lon}
            onChange={(e) => setEditPos({ ...editPos, lon: e.target.value })}
          />
        </FormControl>
        <FormControl
          sx={{ display: { sm: "flex-column", md: "flex-row" }, gap: 2 }}
        >
          <Input
            startDecorator={<LandscapeIcon />}
            size="sm"
            placeholder="Elevation (meters)"
            type="number"
            value={editPos.elevation}
            onChange={(e) =>
              setEditPos({ ...editPos, elevation: e.target.value })
            }
          />
        </FormControl>
      </Stack>
      <div>
        <FormControl sx={{ display: { sm: "contents" } }}>
          <FormLabel>Timezone</FormLabel>
          <Select
            size="sm"
            startDecorator={<AccessTimeFilledRoundedIcon />}
            defaultValue={defaultTz}
            value={editPos.timezone}
            onChange={(e, val) => setEditPos({ ...editPos, timezone: val })}
          >
            {TIMEZONES.map((tzObj) => (
              <Option value={tzObj.name} key={tzObj.name}>
                {tzObj.name}{" "}
                <Typography textColor="text.tertiary" ml={0.5}>
                  (UTC{tzObj.offset})
                </Typography>
              </Option>
            ))}
          </Select>
        </FormControl>
      </div>
    </Stack>
  );
}

function ConfigureLocationMap({ editPos, setEditPos }) {
  const [map, setMap] = useState(null);
  const [centerMarkerPos, setCenterMarkerPos] = useState([0, 0]);
  useEffect(() => {
    if (map && editPos.lat && editPos.lon) {
      map.setView([editPos.lat, editPos.lon]);
      setCenterMarkerPos([editPos.lat, editPos.lon]);
    }
  }, [map, editPos.lat, editPos.lon]);
  useEffect(() => {
    const onMove = (e) => {
      const center = map.getCenter();
      setCenterMarkerPos([center.lat, center.lng]);
      setEditPos({
        lat: center.lat.toFixed(6),
        lon: center.lng.toFixed(6),
      });
    };
    if (map) {
      map.on("move", onMove);
    }
    return () => {
      if (map) {
        map.off("move", onMove);
      }
    };
  }, [map, setEditPos]);
  return (
    <MapContainer
      center={[editPos.lat || 0, editPos.lon || 0]}
      zoom={10}
      scrollWheelZoom={true}
      doubleClickZoom={false}
      style={{ height: "21rem" }}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={centerMarkerPos}></Marker>
    </MapContainer>
  );
}

export default function ConfigureLocationCard() {
  const [editValues, setEditValues] = useState({});
  const tabs = [
    { idx: 0, title: "Map" },
    { idx: 1, title: "Manual" },
  ];

  useEffect(() => {
    getDeviceLocation()
      .then((position) => {
        setEditValues({
          lat: position.lat,
          lon: position.lon,
          timezone: getDefaultTimeZone(),
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const fixedEditValues = {
    lat: parseFloat(editValues?.lat),
    lon: parseFloat(editValues?.lon),
    timezone: editValues?.timezone,
    elevation: parseFloat(editValues?.elevation),
  };

  const submitEditValues = {
    ...fixedEditValues,
  };
  if (!submitEditValues.elevation) {
    submitEditValues.elevation = 0;
  }
  if (!submitEditValues.name) {
    submitEditValues.name = "Current Location";
  }

  return (
    <ConfigureTabsCard
      title="Location"
      subtitle="Your location is used to determine the location of objects in your sky."
      tabs={tabs}
    >
      <ConfigureTabPanel idx={0} p={0}>
        <ConfigureLocationMap
          editPos={fixedEditValues}
          setEditPos={setEditValues}
        />
      </ConfigureTabPanel>
      <ConfigureTabPanel idx={1}>
        <ConfigureLocationManually
          editPos={fixedEditValues}
          setEditPos={setEditValues}
        />
      </ConfigureTabPanel>
    </ConfigureTabsCard>
  );
}