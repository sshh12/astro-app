import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import LandscapeIcon from "@mui/icons-material/Landscape";
import {
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import React, { useCallback, useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { TIMEZONES } from "../constants/timezones";
import { getSystemTimeZone } from "../utils/date";
import { geocodeLocationToName, getDeviceLocation } from "../utils/pos";
import ConfigureTabsCard, { ConfigureTabPanel } from "./ConfigureTabsCard";

function parseFloatSafe(v, defaultValue) {
  if (!v) {
    return defaultValue;
  }
  return parseFloat(v);
}

function ConfigureLocationManually({ editPos, setEditPos }) {
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
      const lat = parseFloatSafe(editPos.lat, 0);
      const lon = parseFloatSafe(editPos.lon, 0);
      map.setView([lat, lon]);
      setCenterMarkerPos([lat, lon]);
    }
  }, [map, editPos.lat, editPos.lon]);
  useEffect(() => {
    const onMove = (e) => {
      const center = map.getCenter();
      setCenterMarkerPos([center.lat, center.lng]);
      setEditPos((latestEditPos) => {
        const isNearBy =
          Math.abs(center.lat - parseFloatSafe(latestEditPos.lat)) < 1 &&
          Math.abs(center.lng - parseFloatSafe(latestEditPos.lon)) < 1;
        return {
          ...latestEditPos,
          lat: center.lat.toFixed(6),
          lon: center.lng.toFixed(6),
          timezone: isNearBy ? latestEditPos.timezone : "",
        };
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

export default function ConfigureLocationCard({
  onSubmit,
  triggerSubmitAndCallback = null,
  showButton = true,
}) {
  const post = null;
  const [loading, setLoading] = useState(false);
  const [editValues, setEditValues] = useState({
    name: "",
    lat: 34.11833,
    lon: -118.300333,
    elevation: 0,
    timezone: "America/Los_Angeles",
  });
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
          elevation: 0,
          timezone: getSystemTimeZone(),
        });
      })
      .catch((err) => {
        console.error(err);
        setEditValues({
          lat: 34.11833,
          lon: -118.300333,
          elevation: 0,
          timezone: "America/Los_Angeles",
        });
      });
  }, []);

  const submit = useCallback(async () => {
    setLoading(true);
    const submitValues = { ...editValues };
    if (!submitValues.elevation) {
      submitValues.elevation = 0;
    }
    submitValues.lat = parseFloatSafe(submitValues.lat, 0);
    submitValues.lon = parseFloatSafe(submitValues.lon, 0);
    if (post && (!submitValues.timezone || !submitValues.name)) {
      try {
        const geoData = await post("get_geocode", {
          lat: submitValues.lat,
          lon: submitValues.lon,
        });
        submitValues.timezone = geoData.timezone;
        if (!submitValues.name) {
          submitValues.name = geocodeLocationToName(geoData.location);
        }
      } catch (err) {
        console.error(err);
        if (!submitValues.timezone) {
          submitValues.timezone = getSystemTimeZone();
        }
        if (!submitValues.name) {
          submitValues.name = "Location";
        }
      }
    }
    if (!submitValues.name) {
      submitValues.name = "Current Location";
    }
    setLoading(false);
    onSubmit(submitValues);
  }, [onSubmit, post, editValues]);

  useEffect(() => {
    if (triggerSubmitAndCallback) {
      submit().then(() => triggerSubmitAndCallback());
    }
  }, [triggerSubmitAndCallback, submit]);

  return (
    <ConfigureTabsCard
      title="Location"
      subtitle="Your location is used to determine the location of objects in your sky."
      tabs={tabs}
      buttonName={showButton && "Add Location"}
      buttonLoading={loading || !post}
      onButtonClick={() => submit()}
    >
      <ConfigureTabPanel idx={0} p={0}>
        <ConfigureLocationMap editPos={editValues} setEditPos={setEditValues} />
      </ConfigureTabPanel>
      <ConfigureTabPanel idx={1}>
        <ConfigureLocationManually
          editPos={editValues}
          setEditPos={setEditValues}
        />
      </ConfigureTabPanel>
    </ConfigureTabsCard>
  );
}
