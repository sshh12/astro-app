import {
  Box,
  Button,
  Card,
  Divider,
  LinearProgress,
  List,
  ListItem,
  Snackbar,
  Typography,
} from "@mui/joy";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import React, { useCallback, useEffect, useState } from "react";
import BaseImagePage from "../components/BaseImagePage";
import { useStorage } from "../providers/storage";
import { listen, ninaPost, testConnection } from "../utils/nina";
import { renderLatLon } from "../utils/pos";

function NinaSetupCard({ connected, setConnected }) {
  const { settingsStore } = useStorage();
  const [host, setHost] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (settingsStore) {
      settingsStore.getItem("nina").then((nina) => {
        if (nina) {
          setHost(nina.host);
          setPassword(nina.password);
        }
      });
    }
  }, [settingsStore]);

  useEffect(() => {
    if (!settingsStore | !host | !password) {
      return;
    }
    const fetchNina = async () => {
      const connected = await testConnection({ host: host, password });
      setConnected(connected);
      if (connected) {
        settingsStore.setItem("nina", { host, password });
      }
    };
    fetchNina();
  }, [host, password, settingsStore, setConnected]);

  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ pt: 2, px: 2 }}>
        <Typography level="title-md">Setup N.I.N.A Control</Typography>
      </Box>
      <Divider />
      <Stack direction="column" spacing={1} sx={{ px: 2, pb: 2 }}>
        <Input
          size="lg"
          placeholder="http://localhost:5100"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        <Input
          type="password"
          size="lg"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LinearProgress
          determinate
          size="sm"
          value={100}
          sx={{
            bgcolor: "background.level3",
            color: connected ? "hsl(100 80% 40%)" : "hsl(10 80% 40%)",
          }}
        />
      </Stack>
    </Card>
  );
}

const CONTROLS = {
  camera: [],
  mount: [
    {
      label: ({ status }) =>
        renderLatLon(status.SiteLatitude, status.SiteLongitude),
    },
    {
      label: ({ status }) => (status.AtPark ? "Parked" : "Not Parked"),
      actions: ({ post }) => [
        { label: "Unpark", action: () => post("/unpark") },
        { label: "Park", action: () => post("/park") },
      ],
    },
  ],
  dome: [
    {
      label: ({ status }) => status.ShutterStatus,
      actions: ({ post }) => [
        { label: "Open", action: () => post("/open") },
        { label: "Close", action: () => post("/close") },
      ],
    },
    {
      label: ({ status }) => `AZ ${status.Azimuth}°`,
      numberInputs: ({ post }) => [
        {
          label: "Azimuth",
          action: (value) => post("/rotate", { Azimuth: value }),
        },
      ],
    },
    {
      label: ({ status }) => (status.AtPark ? "Parked" : "Not Parked"),
      actions: ({ post }) => [{ label: "Park", action: () => post("/park") }],
    },
    {
      label: ({ status }) => (status.AtHome ? "Home" : "Not Home"),
      actions: ({ post }) => [{ label: "Home", action: () => post("/home") }],
    },
  ],
};

function DeviceCard({ name, basePath, status, connectionSettings, controls }) {
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
  const controlProps = { status, post, loading };
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
              <ListItem key={idx} sx={{ justifyContent: "space-between" }}>
                {control.label(controlProps)}
                <Stack direction="row" gap={1}>
                  {control.numberInputs &&
                    control
                      .numberInputs(controlProps)
                      .map((action, idx) => (
                        <NumberButton
                          key={idx}
                          defaultVal={status.Azimuth}
                          loading={loading}
                          apply={(val) => action.action(val)}
                        />
                      ))}
                  {control.actions &&
                    control.actions(controlProps).map((action, idx) => (
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
            ))}
          </List>
          <Button color="danger" onClick={() => post("/disconnect")}>
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
      onBlur={() => apply(value)}
    />
  );
}

export default function ImageNinaPage() {
  const [connected, setConnected] = useState(false);
  const [connectionSettings, setConnectionSettings] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { settingsStore } = useStorage();
  const [alert, setAlert] = useState(null);

  const [cameraStatus, setCameraStatus] = useState(null);
  const [mountStatus, setMountStatus] = useState(null);
  const [domeStatus, setDomeStatus] = useState(null);

  useEffect(() => {
    if (connected && settingsStore) {
      settingsStore.getItem("nina").then((nina) => {
        if (nina) {
          setConnectionSettings({ host: nina.host, password: nina.password });
          listen(
            { host: nina.host, password: nina.password },
            (status) => {
              setSocketConnected(status);
              if (!status) {
                setAlert("Connection lost");
                setConnected(false);
              }
            },
            (data) => {
              console.log(data);
              if (data.Type === "CameraStatus") {
                setCameraStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Camera: ${data.Action}`);
                }
              } else if (data.Type === "MountStatus") {
                setMountStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Mount: ${data.Action}`);
                }
              } else if (data.Type === "DomeStatus") {
                setDomeStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Dome: ${data.Action}`);
                }
              }
            }
          );
        }
      });
    }
  }, [connected, settingsStore]);

  return (
    <BaseImagePage tabIdx={2}>
      <NinaSetupCard connected={connected} setConnected={setConnected} />
      {connected && socketConnected && (
        <DeviceCard
          name="Camera"
          basePath="/api/v1/camera"
          connectionSettings={connectionSettings}
          status={cameraStatus}
          controls={CONTROLS.camera}
        />
      )}
      {connected && socketConnected && (
        <DeviceCard
          name="Mount"
          basePath="/api/v1/mount"
          connectionSettings={connectionSettings}
          status={mountStatus}
          controls={CONTROLS.mount}
        />
      )}
      {connected && socketConnected && (
        <DeviceCard
          name="Dome"
          basePath="/api/v1/dome"
          connectionSettings={connectionSettings}
          status={domeStatus}
          controls={CONTROLS.dome}
        />
      )}
      <Snackbar
        autoHideDuration={4000}
        open={alert !== null}
        variant="success"
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setAlert(null);
        }}
      >
        {alert}
      </Snackbar>
    </BaseImagePage>
  );
}
