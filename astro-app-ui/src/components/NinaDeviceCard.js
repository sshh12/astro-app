import {
  Box,
  Card,
  Divider,
  Input,
  ListDivider,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import Button from "@mui/joy/Button";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Stack from "@mui/joy/Stack";
import React, { useCallback, useEffect, useState } from "react";
import { useStorage } from "../providers/storage";
import { ninaPatch, ninaPost } from "../utils/nina";
import { cleanSearchTerm } from "../utils/object";
import { renderAz, renderLatLon } from "../utils/pos";

function round(val) {
  return Math.round(val * 100) / 100;
}

function SelectAction({ defaultVal, label, loading, apply, options }) {
  const [value, setValue] = useState(defaultVal);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setValue(defaultVal);
  }, [defaultVal]);
  return (
    <>
      <Button loading={loading} size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography>{label}</Typography>
          <Select
            defaultValue={defaultVal}
            value={value}
            onChange={(e, v) => setValue(v)}
          >
            {options.map((option, idx) => (
              <Option key={idx} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Button
            loading={loading}
            size="sm"
            onClick={() => {
              setOpen(false);
              apply(value);
            }}
          >
            Apply
          </Button>
        </ModalDialog>
      </Modal>
    </>
  );
}

function NumberAction({ defaultVal, label, loading, min, max, apply }) {
  const [value, setValue] = useState(defaultVal);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setValue(defaultVal);
  }, [defaultVal]);
  const valid = value >= min && value <= max;
  return (
    <>
      <Button loading={loading} size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography>{label}</Typography>
          <Input
            type="number"
            size="sm"
            min={min}
            max={max}
            value={value}
            disabled={loading}
            error={!valid}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            loading={loading}
            size="sm"
            disabled={!valid}
            onClick={() => {
              setOpen(false);
              apply(parseFloat(value));
            }}
          >
            Apply
          </Button>
        </ModalDialog>
      </Modal>
    </>
  );
}

function ButtonAction({ apply, label, loading }) {
  return (
    <Button loading={loading} size="sm" onClick={() => apply()}>
      {label}
    </Button>
  );
}

function RaDecAction({ defaultVal, label, loading, apply }) {
  const [value, setValue] = useState(defaultVal);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState([]);
  const { objectStore } = useStorage();
  useEffect(() => {
    setValue(defaultVal);
  }, [defaultVal]);
  const valid =
    !!value.ra &&
    !!value.dec &&
    value.ra >= 0 &&
    value.ra <= 24 &&
    value.dec >= -90 &&
    value.dec <= 90;

  useEffect(() => {
    (async () => {
      const cleanTerm = cleanSearchTerm(searchTerm);
      const matches = [];
      if (cleanTerm && objectStore) {
        await objectStore.iterate((val) => {
          if (!!val.ra && val.searchKey.includes(cleanTerm)) {
            matches.push(val);
          }
        });
      }
      setMatches(matches.slice(0, 5));
    })();
  }, [searchTerm, objectStore]);

  return (
    <>
      <Button loading={loading} size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography>{label}</Typography>
          <Input
            type="text"
            size="sm"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {matches.map((match, idx) => (
            <Button
              key={idx}
              onClick={() => {
                setOpen(false);
                apply({ ra: match.ra, dec: match.dec });
              }}
            >
              Go to {match.name}
            </Button>
          ))}
          <Divider />
          <Input
            type="number"
            size="sm"
            value={value.ra}
            disabled={loading}
            error={!valid}
            onChange={(e) => setValue({ ...value, ra: e.target.value })}
          />
          <Input
            type="number"
            size="sm"
            value={value.dec}
            disabled={loading}
            error={!valid}
            onChange={(e) => setValue({ ...value, dec: e.target.value })}
          />
          <Button
            loading={loading}
            size="sm"
            disabled={!valid}
            onClick={() => {
              setOpen(false);
              apply({ ra: value.ra, dec: value.dec });
            }}
          >
            Go to RA/DEC
          </Button>
        </ModalDialog>
      </Modal>
    </>
  );
}

const ACTION_TYPES = {
  button: ButtonAction,
  select: SelectAction,
  number: NumberAction,
  radec: RaDecAction,
};

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
  mount: ({ status, post, patch }) => [
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
    },
    {
      label: `Pointing: RA ${round(status.RightAscension)} / DEC ${round(
        status.Declination
      )}`,
      actions: [
        {
          label: "Slew RA/DEC",
          type: "radec",
          defaultVal: { ra: status.RightAscension, dec: status.Declination },
          apply: ({ ra, dec }) =>
            post("/slew", { RightAscension: ra, Declination: dec }),
        },
      ],
    },
    {
      label: `Tracking: ${status.TrackingMode}`,
      actions: [
        {
          label: "Change Tracking",
          type: "select",
          options: status.TrackingModes.map((mode) => ({
            value: mode,
            label: mode,
          })),
          defaultVal: status.TrackingMode,
          apply: (value) => patch("/trackingmode", { TrackingMode: value }),
        },
      ],
    },
    {
      label: status.AtPark ? "Parked" : "Not Parked",
      actions: [
        ...(!status.AtPark
          ? [{ label: "Park", apply: () => post("/park") }]
          : []),
        ...(status.AtPark
          ? [{ label: "Unpark", apply: () => post("/unpark") }]
          : []),
      ],
    },
  ],
  dome: ({ status, post, patch }) => [
    {
      label: status.ShutterStatus,
      actions: [
        ...(status.ShutterStatus !== "ShutterOpen"
          ? [{ label: "Open", apply: () => post("/open") }]
          : []),
        ...(status.ShutterStatus !== "ShutterClosed"
          ? [{ label: "Close", apply: () => post("/close") }]
          : []),
      ],
    },
    {
      label: `AZ ${renderAz(round(status.Azimuth))}`,
      actions: [
        {
          label: "Rotate",
          type: "number",
          defaultVal: round(status.Azimuth),
          min: 0,
          max: 359,
          apply: (value) => post("/rotate", { Azimuth: value }),
        },
      ],
    },
    {
      label: status.IsFollowingScope ? "Following Mount" : "Not Following",
      actions: [
        ...(!status.IsFollowingScope
          ? [
              {
                label: "Enable Following",
                apply: () => patch("/following", { Enabled: true }),
              },
              {
                label: "Sync",
                apply: () => post("/sync"),
              },
            ]
          : []),
        ...(status.IsFollowingScope
          ? [
              {
                label: "Disable Following",
                apply: () => patch("/following", { Enabled: false }),
              },
            ]
          : []),
      ],
    },
    {
      label: status.AtPark ? "Parked" : "Not Parked",
      actions: [
        ...(!status.AtPark
          ? [{ label: "Park", apply: () => post("/park") }]
          : []),
      ],
    },
    {
      label: status.AtHome ? "Homed" : "Not Home",
      actions: [
        ...(!status.AtHome
          ? [{ label: "Home", apply: () => post("/home") }]
          : []),
      ],
    },
  ],
  filterWheel: ({ status, patch }) => [
    {
      label: `Filter: ${status.SelectedFilter.Name} (${status.SelectedFilter.Position})`,
      actions: [
        {
          label: "Change Filter",
          type: "select",
          options: [
            { label: "Filter 0", value: 0 },
            { label: "Filter 1", value: 1 },
            { label: "Filter 2", value: 2 },
            { label: "Filter 3", value: 3 },
            { label: "Filter 4", value: 4 },
            { label: "Filter 5", value: 5 },
            { label: "Filter 6", value: 6 },
            { label: "Filter 7", value: 7 },
          ],
          defaultVal: status.SelectedFilter.Position,
          apply: (value) => patch("/filter", { Position: value }),
        },
      ],
    },
  ],
  focuser: ({ status, patch }) => [
    { label: `Temperature: ${round(status.Temperature)}° C` },
    {
      label: `Position: ${status.Position}`,
      actions: [
        {
          label: "Move",
          type: "number",
          defaultVal: status.Position,
          min: 0,
          max: 50000,
          apply: (value) => patch("/position", { Position: value }),
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
                    {control.actions &&
                      control.actions.map((action, idx) => {
                        const ActionElem =
                          ACTION_TYPES[action.type || "button"];
                        return (
                          <ActionElem
                            key={action?.defaultValue || idx}
                            {...action}
                            loading={loading}
                          />
                        );
                      })}
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
