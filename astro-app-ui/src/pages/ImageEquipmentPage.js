import {
  Box,
  Card,
  Divider,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import BaseImagePage from "../components/BaseImagePage";
import { useBackend } from "../providers/backend";
import { equipmentToDetails } from "../utils/equipment";

function EquipmentStatsCard() {
  const { user } = useBackend();
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (user && user.equipment.length > 0) {
      const active = user.equipment.find((eq) => eq.active);
      if (active) {
        setSelectedId(active.id);
      }
    }
  }, [user]);
  const equipment = user?.equipment || [];
  equipment.sort((a, b) => (a.active ? -1 : b.active ? 1 : 0));
  const eqSelected = equipment.find((eq) => eq.id === selectedId);
  const selectedDetails = eqSelected && equipmentToDetails(eqSelected);
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ pt: 2, px: 2 }}>
        <Typography level="title-md">Equipment Details</Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          px: 1,
          py: 0.5,
          maxWidth: "90vw",
          justifyContent: "center",
          margin: "auto",
        }}
      >
        <Select
          value={selectedId}
          onChange={(e, v) => setSelectedId(v)}
          size="sm"
          sx={{ flexGrow: 1 }}
        >
          {equipment.map((eq) => (
            <Option key={eq.id} value={eq.id}>
              {equipmentToDetails(eq).title}
            </Option>
          ))}
        </Select>
      </Box>
      <Divider />
      <List>
        {selectedDetails &&
          selectedDetails.details.map((d, idx) => (
            <>
              <ListItem>
                <ListItemContent>
                  <Typography level="body-sm" fontWeight="lg">
                    {d.name}
                  </Typography>
                </ListItemContent>
                <Typography level="body-sm">{d.value}</Typography>
              </ListItem>
              {idx < selectedDetails.details.length - 1 && <ListDivider />}
            </>
          ))}
      </List>
    </Card>
  );
}

export default function ImageEquipmentPage() {
  return (
    <BaseImagePage tabIdx={1}>
      <EquipmentStatsCard />
    </BaseImagePage>
  );
}
