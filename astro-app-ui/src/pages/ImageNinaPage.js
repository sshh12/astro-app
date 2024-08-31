import {
  Box,
  Button,
  Card,
  Divider,
  LinearProgress,
  List,
  ListDivider,
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

function DeviceCard({
  name,
  basePath,
  status,
  connectionSettings,
  DetailsCard,
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
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ pt: 2, px: 2 }}>
        <Typography level="title-md">{status?.Name || name}</Typography>
      </Box>
      <Divider />
      {status?.Connected ? (
        <Stack direction="column" spacing={1} sx={{ px: 2, pb: 2 }}>
          <DetailsCard status={status} post={post} loading={loading} />
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

function DomeDetails({ status, post, loading }) {
  return (
    <List>
      <ListItem sx={{ justifyContent: "space-between" }}>
        {status.ShutterStatus}
        <Stack direction="row" gap={1}>
          <Button loading={loading} size="sm" onClick={() => post("/close")}>
            Close
          </Button>
          <Button loading={loading} size="sm" onClick={() => post("/open")}>
            Open
          </Button>
        </Stack>
      </ListItem>
      <ListDivider inset="gutter" />
      <ListItem sx={{ justifyContent: "space-between" }}>
        AZ {status.Azimuth}°
        <Stack direction="row" gap={1}>
          <NumberButton
            loading={loading}
            defaultVal={status.Azimuth}
            apply={(val) => post("/rotate", { Azimuth: val })}
          />
        </Stack>
      </ListItem>
      <ListDivider inset="gutter" />
      <ListItem sx={{ justifyContent: "space-between" }}>
        {status.AtPark ? "Parked" : "Not Parked"}
        <Stack direction="row" gap={1}>
          <Button loading={loading} size="sm" onClick={() => post("/park")}>
            Park
          </Button>
        </Stack>
      </ListItem>
      <ListDivider inset="gutter" />
      <ListItem sx={{ justifyContent: "space-between" }}>
        {status.AtHome ? "Home" : "Not Home"}
        <Stack direction="row" gap={1}>
          <Button loading={loading} size="sm" onClick={() => post("/home")}>
            Home
          </Button>
        </Stack>
      </ListItem>
    </List>
  );
}

export default function ImageNinaPage() {
  const [connected, setConnected] = useState(false);
  const [connectionSettings, setConnectionSettings] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { settingsStore } = useStorage();
  const [alert, setAlert] = useState(null);

  const [cameraStatus, setCameraStatus] = useState(null);
  const [telescopeStatus, setTelescopeStatus] = useState(null);
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
              } else if (data.Type === "TelescopeStatus") {
                setTelescopeStatus(data);
                if (data.Action !== "NONE") {
                  setAlert(`Telescope: ${data.Action}`);
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
        />
      )}
      {connected && socketConnected && (
        <DeviceCard
          name="Telescope"
          basePath="/api/v1/telescope"
          connectionSettings={connectionSettings}
          status={telescopeStatus}
        />
      )}
      {connected && socketConnected && (
        <DeviceCard
          name="Dome"
          basePath="/api/v1/dome"
          connectionSettings={connectionSettings}
          status={domeStatus}
          DetailsCard={DomeDetails}
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
