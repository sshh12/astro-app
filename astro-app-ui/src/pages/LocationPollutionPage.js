import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  Divider,
  ListDivider,
  Stack,
  ListItem,
  List,
  ListItemContent,
} from "@mui/joy";
import { useBackend } from "../providers/backend";
import BaseLocationPage from "../components/BaseLocationPage";
import { useStorage } from "../providers/storage";
import { fetchLPData, getLPDetails } from "../utils/pos";

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
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Sky Quality</Typography>
        </Stack>
        <Typography level="body-sm">
          The night sky quality of your location.
        </Typography>
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

export default function LocationPollutionPage() {
  const { location } = useBackend();
  return (
    <BaseLocationPage tabIdx={1}>
      <SkyQualityCard location={location} />
    </BaseLocationPage>
  );
}
