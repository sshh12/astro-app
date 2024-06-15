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
} from "@mui/joy";
import { useBackend } from "../providers/backend";
import { Delete, Home, LocationOn } from "@mui/icons-material";

export default function ProfileLocationCard({ setOpen }) {
  const { user } = useBackend();
  const locations = user?.location || [];
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
              endAction={
                <Stack spacing={1} direction="row">
                  <IconButton size="sm" color="danger">
                    <Delete />
                  </IconButton>
                  {!loc.active && (
                    <IconButton size="sm" color="primary">
                      <Home />
                    </IconButton>
                  )}
                </Stack>
              }
            >
              <ListItemDecorator>
                <LocationOn />
              </ListItemDecorator>
              {loc.name}
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
