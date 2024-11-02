import { Delete, PlayArrow } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardOverflow,
  Divider,
  IconButton,
  List,
  ListDivider,
  ListItem,
  ListItemDecorator,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import React from "react";
import { equipmentToDetails } from "../utils/equipment";

export default function ProfileEquipmentCard({ setOpen }) {
  const { user, updateUser } = useBackend();
  const equipment = user?.equipment || [];
  equipment.sort((a, b) => (a.active ? -1 : b.active ? 1 : 0));
  return (
    <Card sx={{ p: 0, gap: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">Equipment</Typography>
        <Typography level="body-sm">
          Your equipment is used to render accurate views of the sky and
          optimize search.
        </Typography>
      </Box>
      <Divider />
      <List
        variant="plain"
        sx={{
          borderRadius: "sm",
        }}
      >
        {equipment.map((eq, idx) => {
          const details = equipmentToDetails(eq);
          return (
            <>
              <ListItem
                sx={{ alignItems: "center" }}
                endAction={
                  <Stack spacing={1} direction="row">
                    {!eq.active && (
                      <Tooltip title="Set as active equipment">
                        <IconButton
                          size="sm"
                          color="primary"
                          onClick={() => {
                            updateUser("set_active_equipment", { id: eq.id });
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Tooltip>
                    )}
                    {equipment.length > 1 && (
                      <Tooltip title="Delete this equipment">
                        <IconButton
                          size="sm"
                          color="danger"
                          onClick={() => {
                            updateUser("delete_equipment", { id: eq.id });
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                }
              >
                <ListItemDecorator>
                  <details.icon />
                </ListItemDecorator>
                <Stack sx={{ width: "100%" }}>
                  {details.title.split(" / ").map((row) => (
                    <Typography noWrap key={row} level="body-sm">
                      {row}
                    </Typography>
                  ))}
                </Stack>
              </ListItem>
              {idx !== equipment.length - 1 && <ListDivider />}
            </>
          );
        })}
      </List>
      <Divider />
      <CardOverflow
        sx={{ paddingRight: 2, paddingBottom: 2, marginTop: "1rem" }}
      >
        <CardActions sx={{ alignSelf: "flex-end" }}>
          <Button size="sm" variant="solid" onClick={() => setOpen(true)}>
            Add Equipment
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
