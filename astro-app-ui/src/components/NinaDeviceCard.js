import { Box, Card, Divider, ListDivider, Typography } from "@mui/joy";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Stack from "@mui/joy/Stack";
import React, { useCallback, useEffect, useState } from "react";
import { ninaPatch, ninaPost } from "../utils/nina";
import { renderAz, renderLatLon } from "../utils/pos";

function round(val) {
  return Math.round(val * 100) / 100;
}

function NumberButton({ defaultVal, loading, apply }) {
  const [value, setValue] = useState(defaultVal);
  useEffect(() => {
    setValue(defaultVal);
  }, [defaultVal]);
  return (
    <Input
      type="number"
      size="sm"
      value={value}
      disabled={loading}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (/^\d+$/.test(value)) {
          apply(value);
        } else {
          setValue(defaultVal);
        }
      }}
    />
  );
}

export const CONTROLS = {
  camera: ({ status }) => [
    {
      label: `Sensor: ${status.XSize} x ${status.YSize} (${
        status.SensorType
      }, ${round(status.PixelSize)}µm)`,
    },
    {
      label: `Gain: ${status.Gain} (${status.Offset})`,
    },
    {
      label: `Temperature: ${status.Temperature}° C`,
    },
  ],
  mount: ({ status, post }) => [
    {
      label: `Sidereal: ${status.SiderealTime}`,
    },
    {
      label:
        "Location: " +
        renderLatLon(status.SiteLatitude, status.SiteLongitude) +
        ` @ ${round(status.SiteElevation)}m`,
    },
    {
      label: `Pointing: AZ ${renderAz(round(status.Azimuth))} / ALT ${round(
        status.Altitude
      )}° (${status.SideOfPier})`,
      numberInputs: [],
    },
    {
      label: `Tracking: ${status.TrackingMode}`,
    },
    {
      label: status.AtPark ? "Parked" : "Not Parked",
      actions: [
        ...(!status.AtPark
          ? [{ label: "Park", action: () => post("/park") }]
          : []),
        ...(status.AtPark
          ? [{ label: "Unpark", action: () => post("/unpark") }]
          : []),
      ],
    },
  ],
  dome: ({ status, post, patch }) => [
    {
      label: status.ShutterStatus,
      actions: [
        ...(status.ShutterStatus !== "ShutterOpen"
          ? [{ label: "Open", action: () => post("/open") }]
          : []),
        ...(status.ShutterStatus !== "ShutterClosed"
          ? [{ label: "Close", action: () => post("/close") }]
          : []),
      ],
    },
    {
      label: `AZ ${renderAz(round(status.Azimuth))}`,
      numberInputs: [
        ...(!status.IsFollowingScope
          ? [
              {
                label: "Azimuth",
                default: round(status.Azimuth),
                action: (value) => post("/rotate", { Azimuth: value }),
              },
            ]
          : []),
      ],
    },
    {
      label: status.IsFollowingScope ? "Following Mount" : "Not Following",
      actions: [
        ...(!status.IsFollowingScope
          ? [
              {
                label: "Enable Following",
                action: () => patch("/following", { Enabled: true }),
              },
              {
                label: "Sync",
                action: () => post("/sync"),
              },
            ]
          : []),
        ...(status.IsFollowingScope
          ? [
              {
                label: "Disable Following",
                action: () => patch("/following", { Enabled: false }),
              },
            ]
          : []),
      ],
    },
    {
      label: status.AtPark ? "Parked" : "Not Parked",
      actions: [
        ...(!status.AtPark
          ? [{ label: "Park", action: () => post("/park") }]
          : []),
      ],
    },
    {
      label: status.AtHome ? "Homed" : "Not Home",
      actions: [
        ...(!status.AtHome
          ? [{ label: "Home", action: () => post("/home") }]
          : []),
      ],
    },
  ],
  filterWheel: ({ status, patch }) => [
    {
      label: `Filter: ${status.SelectedFilter.Name} (${status.SelectedFilter.Position})`,
      numberInputs: [
        {
          label: "Filter Position",
          default: status.SelectedFilter.Position,
          action: (value) => patch("/filter", { Position: value }),
        },
      ],
    },
  ],
  focuser: ({ status, patch }) => [
    { label: `Temperature: ${round(status.Temperature)}° C` },
    {
      label: `Position: ${status.Position}`,
      numberInputs: [
        {
          label: "Position",
          default: status.Position,
          action: (value) => patch("/position", { Position: value }),
        },
      ],
    },
  ],
  flatDevice: ({ status }) => [
    { label: `Cover State: ${status.CoverState}` },
    {
      label: `Light: ${
        status.LightOn ? "On at " + status.Brightness : "Off"
      } (${status.MinBrightness} - ${status.MaxBrightness})`,
    },
  ],
  rotator: ({ status }) => [
    { label: `Mechanical Position: ${status.MechanicalPosition}°` },
  ],
  switch: ({ status }) => [
    ...status?.Gauges.map((gauge) => ({
      label: `${gauge.Name}: ${gauge.Value}`,
    })),
  ],
  weather: ({ status }) => [
    { label: `Temperature: ${round(status.Temperature)}° C` },
    { label: `Humidity: ${round(status.Humidity)}%` },
    { label: `Dew Point: ${round(status.DewPoint)}° C` },
    { label: `Wind Speed: ${round(status.WindSpeed)} km/h` },
    { label: `Wind Direction: ${renderAz(round(status.WindDirection))}` },
    { label: `Pressure: ${round(status.Pressure)} hPa` },
    { label: `Rain Rate: ${round(status.RainRate)} mm/h` },
    { label: `Cloud Cover: ${round(status.CloudCover)}%` },
    { label: `Sky Brightness: ${round(status.SkyBrightness)} lx` },
    { label: `Sky Quality: ${round(status.SkyQuality)} mag/arcsec^2` },
    { label: `Star FWHM: ${round(status.StarFWHM)}` },
  ],
  safetyMonitor: ({ status }) => [
    { label: `Safe: ${status.IsSafe ? "Yes" : "No"}` },
  ],
};

export default function NinaDeviceCard({
  name,
  basePath,
  status,
  connectionSettings,
  controlsFunc,
}) {
  const [loading, setLoading] = useState(false);
  const post = useCallback(
    (path, params = null) => {
      setLoading(true);
      return ninaPost(connectionSettings, basePath + path, params).then(
        (resp) => {
          setLoading(false);
          return resp;
        }
      );
    },
    [connectionSettings, basePath]
  );
  const patch = useCallback(
    (path, params = null) => {
      setLoading(true);
      return ninaPatch(connectionSettings, basePath + path, params).then(
        (resp) => {
          setLoading(false);
          return resp;
        }
      );
    },
    [connectionSettings, basePath]
  );
  const controls =
    status && status.Connected ? controlsFunc({ status, post, patch }) : [];
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ pt: 2, px: 2 }}>
        <Typography level="title-md">{status?.Name || name}</Typography>
      </Box>
      <Divider />
      {status?.Connected ? (
        <Stack direction="column" spacing={1} sx={{ px: 2, pb: 2 }}>
          <List>
            {controls?.map((control, idx) => (
              <div key={idx}>
                <ListItem sx={{ justifyContent: "space-between" }}>
                  {control.label}
                  <Stack direction="row" gap={1}>
                    {control.numberInputs &&
                      control.numberInputs.map((action, idx) => (
                        <NumberButton
                          key={idx}
                          defaultVal={action.default}
                          loading={loading}
                          apply={(val) => action.action(val)}
                        />
                      ))}
                    {control.actions &&
                      control.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          loading={loading}
                          size="sm"
                          onClick={() => action.action()}
                        >
                          {action.label}
                        </Button>
                      ))}
                  </Stack>
                </ListItem>
                <ListDivider />
              </div>
            ))}
          </List>
          <Button
            color="danger"
            onClick={() => {
              setLoading(true);
              post("/disconnect").then(() => setLoading(false));
            }}
          >
            Disconnect
          </Button>
        </Stack>
      ) : (
        <Stack direction="column" spacing={1} sx={{ px: 2, pb: 2 }}>
          <Button loading={loading} onClick={() => post("/connect")}>
            Connect
          </Button>
        </Stack>
      )}
    </Card>
  );
}
