import * as React from "react";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Drawer from "@mui/joy/Drawer";
import ModalClose from "@mui/joy/ModalClose";
import DialogTitle from "@mui/joy/DialogTitle";
import { yellow } from "@mui/material/colors";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Navigation from "./Navigation";
import Layout from "./Layout";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        justifyContent: "space-between",
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{ display: { xs: "none", sm: "flex" } }}
      >
        <IconButton
          size="md"
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            borderRadius: "50%",
            backgroundColor: "rgb(10, 39, 68)",
          }}
        >
          <AutoAwesomeIcon sx={{ color: yellow[500] }} />
        </IconButton>
        {Layout.Tabs.map((tab) => (
          <Button
            key={tab.label}
            variant="plain"
            color="neutral"
            component="a"
            aria-pressed={Layout.locationToTab(location).label === tab.label}
            href={tab.href}
            size="sm"
            sx={{ alignSelf: "center" }}
          >
            {tab.label}
          </Button>
        ))}
      </Stack>
      <Box sx={{ display: { xs: "inline-flex", sm: "none" } }}>
        <IconButton
          variant="plain"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <MenuRoundedIcon />
        </IconButton>
        <Drawer
          sx={{ display: { xs: "inline-flex", sm: "none" } }}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ModalClose />
          <DialogTitle>Acme Co.</DialogTitle>
          <Box sx={{ px: 1 }}>
            <Navigation />
          </Box>
        </Drawer>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1.5,
          alignItems: "center",
        }}
      >
        <Input
          size="sm"
          variant="outlined"
          placeholder="Search anything…"
          startDecorator={<SearchRoundedIcon color="primary" />}
          sx={{
            alignSelf: "center",
            display: {
              xs: "none",
              sm: "flex",
            },
          }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          sx={{
            display: { xs: "inline-flex", sm: "none" },
            alignSelf: "center",
          }}
        >
          <SearchRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
