import {
  Box,
  Card,
  Divider,
  LinearProgress,
  Snackbar,
  Typography,
} from "@mui/joy";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import React, { useEffect, useState } from "react";
import BaseImagePage from "../components/BaseImagePage";
import NinaDeviceCard, { CONTROLS } from "../components/NinaDeviceCard";
import { useStorage } from "../providers/storage";
import { listen, testConnection } from "../utils/nina";

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

export default function ImageNinaPage() {
  const [connected, setConnected] = useState(false);
  const [connectionSettings, setConnectionSettings] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { settingsStore } = useStorage();
  const [alert, setAlert] = useState(null);

  const [cameraStatus, setCameraStatus] = useState(null);
  const [mountStatus, setMountStatus] = useState(null);
  const [domeStatus, setDomeStatus] = useState(null);
  const [filterWheelStatus, setFilterWheelStatus] = useState(null);
  const [focuserStatus, setFocuserStatus] = useState(null);
  const [flatDeviceStatus, setFlatDeviceStatus] = useState(null);
  const [rotatorStatus, setRotatorStatus] = useState(null);
  const [switchStatus, setSwitchStatus] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState(null);
  const [safetyMonitorStatus, setSafetyMonitorStatus] = useState(null);

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
              } else if (data.Type === "FilterWheelStatus") {
                setFilterWheelStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Filter Wheel: ${data.Action}`);
                }
              } else if (data.Type === "FocuserStatus") {
                setFocuserStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Focuser: ${data.Action}`);
                }
              } else if (data.Type === "FlatDeviceStatus") {
                setFlatDeviceStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Flat Device: ${data.Action}`);
                }
              } else if (data.Type === "RotatorStatus") {
                setRotatorStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Rotator: ${data.Action}`);
                }
              } else if (data.Type === "SwitchStatus") {
                setSwitchStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Switch: ${data.Action}`);
                }
              } else if (data.Type === "WeatherStatus") {
                setWeatherStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Weather: ${data.Action}`);
                }
              } else if (data.Type === "SafetyMonitorStatus") {
                setSafetyMonitorStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Safety Monitor: ${data.Action}`);
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
        <NinaDeviceCard
          name="Camera"
          basePath="/api/v1/camera"
          connectionSettings={connectionSettings}
          status={cameraStatus}
          controlsFunc={CONTROLS.camera}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Mount"
          basePath="/api/v1/mount"
          connectionSettings={connectionSettings}
          status={mountStatus}
          controlsFunc={CONTROLS.mount}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Dome"
          basePath="/api/v1/dome"
          connectionSettings={connectionSettings}
          status={domeStatus}
          controlsFunc={CONTROLS.dome}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Filter Wheel"
          basePath="/api/v1/filterwheel"
          connectionSettings={connectionSettings}
          status={filterWheelStatus}
          controlsFunc={CONTROLS.filterWheel}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Focuser"
          basePath="/api/v1/focuser"
          connectionSettings={connectionSettings}
          status={focuserStatus}
          controlsFunc={CONTROLS.focuser}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Flat Device"
          basePath="/api/v1/flatdevice"
          connectionSettings={connectionSettings}
          status={flatDeviceStatus}
          controlsFunc={CONTROLS.flatDevice}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Rotator"
          basePath="/api/v1/rotator"
          connectionSettings={connectionSettings}
          status={rotatorStatus}
          controlsFunc={CONTROLS.rotator}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Switch"
          basePath="/api/v1/switch"
          connectionSettings={connectionSettings}
          status={switchStatus}
          controlsFunc={CONTROLS.switch}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Weather"
          basePath="/api/v1/weather"
          connectionSettings={connectionSettings}
          status={weatherStatus}
          controlsFunc={CONTROLS.weather}
        />
      )}
      {connected && socketConnected && (
        <NinaDeviceCard
          name="Safety Monitor"
          basePath="/api/v1/safetymonitor"
          connectionSettings={connectionSettings}
          status={safetyMonitorStatus}
          controlsFunc={CONTROLS.safetyMonitor}
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
