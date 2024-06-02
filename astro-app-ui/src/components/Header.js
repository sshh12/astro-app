import * as React from "react";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import { yellow } from "@mui/material/colors";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Layout from "./Layout";
import { useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Typography } from "@mui/material";

export default function Header() {
  const location = useLocation();
  return (
    <Box
      sx={{
        display: "flex",
        p: 2,
        flexGrow: 1,
        justifyContent: "space-between",
        bgcolor: { xs: "background.body", sm: "background.surface" },
        height: "100%",
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
            border: "2px solid",
            borderColor: "divider",
            backgroundColor: "#111827",
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
      <Stack
        direction="column"
        alignItems="start"
        sx={{
          display: { xs: "inline-flex", sm: "none" },
          marginTop: "-0.5rem",
        }}
      >
        <Typography level="body-sm">Sky</Typography>
        <Typography component="h4" level="h4">
          1:36:33 PM
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1.5,
          alignItems: "center",
          justifyItems: "end",
          marginLeft: "auto",
        }}
      >
        <Input
          size="sm"
          variant="outlined"
          placeholder="Search"
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
        <Box sx={{ display: { xs: "none", sm: "flex" } }}>
          <ThemeToggle />
        </Box>
      </Box>
    </Box>
  );
}
