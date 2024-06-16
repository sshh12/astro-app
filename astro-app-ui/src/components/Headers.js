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
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";

function DesktopTabs() {
  const location = useLocation();
  return (
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
        <Link to={tab.href} style={{ textDecoration: "none" }}>
          <Button
            key={tab.label}
            variant="plain"
            color="neutral"
            component="a"
            aria-pressed={Layout.locationToTab(location).label === tab.label}
            size="sm"
            sx={{ alignSelf: "center" }}
          >
            {tab.label}
          </Button>
        </Link>
      ))}
    </Stack>
  );
}

export function Header({ title, subtitle, enableSearch }) {
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
      <DesktopTabs />
      <Stack
        direction="column"
        alignItems="start"
        sx={{
          display: { xs: "inline-flex", sm: "none" },
          marginTop: "-0.5rem",
        }}
      >
        <Typography level="body-sm">{title}</Typography>
        <Typography component="h4" level="h4">
          {subtitle}
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
        {enableSearch && (
          <>
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
          </>
        )}
        <Box sx={{ display: { xs: "none", sm: "flex" } }}>
          <ThemeToggle />
        </Box>
      </Box>
    </Box>
  );
}

export function SubPageHeader({ title, backPath }) {
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
      <DesktopTabs />
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{ display: { xs: "flex", sm: "none" } }}
      >
        <Link to={{ pathname: backPath }}>
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              alignSelf: "center",
            }}
          >
            <ArrowBack />
          </IconButton>
        </Link>
      </Stack>
      <Stack
        alignItems="center"
        sx={{
          display: { xs: "flex", sm: "none" },
          ml: 1,
          mt: "0.2rem",
        }}
      >
        <Typography level="body-sm">{title}</Typography>
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

        <Box sx={{ display: { xs: "none", sm: "flex" } }}>
          <ThemeToggle />
        </Box>
      </Box>
    </Box>
  );
}
