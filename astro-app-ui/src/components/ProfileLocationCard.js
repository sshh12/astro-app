import React from "react";
import {
  Typography,
  Box,
  Card,
  Divider,
  Stack,
  ListItem,
  ListItemDecorator,
  List,
  ListDivider,
  CardOverflow,
  CardActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/joy";
import { useBackend } from "../providers/backend";
import { Delete, Home, LocationOn } from "@mui/icons-material";

export default function ProfileLocationCard({ setOpen }) {
  const { user, updateUser } = useBackend();
  const locations = user?.location || [];
  locations.sort((a, b) => (a.active ? -1 : b.active ? 1 : 0));
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">Location</Typography>
        <Typography level="body-sm">
          Your location is used to determine the location of objects in your
          sky.
        </Typography>
      </Box>
      <Divider />
      <List
        variant="plain"
        sx={{
          borderRadius: "sm",
        }}
      >
        {locations.map((loc, idx) => (
          <>
            <ListItem
              sx={{ alignItems: "center" }}
              endAction={
                <Stack spacing={1} direction="row">
                  {!loc.active && (
                    <Tooltip title="Set as active location">
                      <IconButton
                        size="sm"
                        color="primary"
                        onClick={() => {
                          updateUser("set_active_location", { id: loc.id });
                        }}
                      >
                        <Home />
                      </IconButton>
                    </Tooltip>
                  )}
                  {locations.length > 1 && (
                    <Tooltip title="Delete this location">
                      <IconButton
                        size="sm"
                        color="danger"
                        onClick={() => {
                          updateUser("delete_location", { id: loc.id });
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
                <LocationOn />
              </ListItemDecorator>
              <Typography level="body-sm">{loc.name}</Typography>
            </ListItem>
            {idx !== locations.length - 1 && <ListDivider />}
          </>
        ))}
      </List>
      <Divider />
      <CardOverflow sx={{ paddingRight: 2, paddingBottom: 2 }}>
        <CardActions sx={{ alignSelf: "flex-end" }}>
          <Button size="sm" variant="solid" onClick={() => setOpen(true)}>
            Add Location
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
