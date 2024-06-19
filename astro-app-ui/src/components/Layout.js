import * as React from "react";
import { grey } from "@mui/material/colors";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CameraIcon from "@mui/icons-material/Camera";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import { useLocation, Link } from "react-router-dom";

const Tabs = [
  { label: "Sky", href: "/sky", icon: AutoAwesome, color: grey[200] },
  {
    label: "Image",
    href: "/image/capture",
    icon: CameraIcon,
    color: grey[200],
  },
  {
    label: "Location",
    href: "/location/weather",
    icon: LocationOnIcon,
    color: grey[200],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: AccountBoxIcon,
    color: grey[200],
  },
];

function locationToTab(location) {
  return Tabs.find((tab) =>
    location.pathname.startsWith("/" + tab.href.split("/")[1])
  );
}

function Root(props) {
  return (
    <Box
      {...props}
      sx={[
        {
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(64px, 200px) minmax(450px, 1fr)",
            md: "minmax(160px, 300px) minmax(300px, 500px) minmax(500px, 1fr)",
          },
          gridTemplateRows: "64px 1fr",
          minHeight: "100vh",
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

function Header(props) {
  return (
    <Box
      component="header"
      className="Header"
      {...props}
      sx={[
        {
          gap: 2,
          bgcolor: { xs: "background", sm: "background.surface" },
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gridColumn: "1 / -1",
          borderBottom: { xs: "none", sm: "1px solid" },
          borderColor: { xs: "none", sm: "divider" },
          position: "sticky",
          top: 0,
          zIndex: 1100,
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

function SideNav(props) {
  return (
    <Box
      component="nav"
      className="Navigation"
      {...props}
      sx={[
        {
          p: 2,
          bgcolor: "background.surface",
          borderRight: "1px solid",
          borderColor: "divider",
          display: {
            xs: "none",
            sm: "initial",
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

function SidePane(props) {
  return (
    <Box
      className="Inbox"
      {...props}
      sx={[
        {
          bgcolor: "background.surface",
          borderRight: "1px solid",
          borderColor: "divider",
          display: {
            xs: "none",
            md: "initial",
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

function Main({ children }) {
  return (
    <Box component="main" className="Main" sx={{ p: { xs: 1, sm: 2 } }}>
      {children}
    </Box>
  );
}

function SideDrawer(props) {
  const { onClose, ...other } = props;
  return (
    <Box
      {...other}
      sx={[
        { position: "fixed", zIndex: 1200, width: "100%", height: "100%" },
        ...(Array.isArray(other.sx) ? other.sx : [other.sx]),
      ]}
    >
      <Box
        role="button"
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: (theme) =>
            `rgba(${theme.vars.palette.neutral.darkChannel} / 0.8)`,
        }}
      />
      <Sheet
        sx={{
          minWidth: 256,
          width: "max-content",
          height: "100%",
          p: 2,
          boxShadow: "lg",
          bgcolor: "background.surface",
        }}
      >
        {props.children}
      </Sheet>
    </Box>
  );
}

function MobileTabs() {
  const location = useLocation();
  return (
    <Stack
      id="tab-bar"
      direction="row"
      justifyContent="space-around"
      sx={{
        display: { xs: "flex", sm: "none" },
        zIndex: "999",
        bottom: 0,
        position: "fixed",
        width: "100dvw",
        paddingLeft: 1,
        paddingRight: 1,
        backgroundColor: "background.body",
        borderTop: "1px solid",
        borderColor: "divider",
        paddingBottom: "calc(1 * var(--joy-spacing))",
        paddingTop: "calc(1 * var(--joy-spacing))",
      }}
    >
      {Tabs.map((tab) => (
        <Link
          to={tab.href}
          style={{
            textDecoration: "none",
            flexDirection: "column",
            flex: 1,
          }}
          key={tab.label}
        >
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            sx={{
              height: "3rem",
              width: "100%",
            }}
            startDecorator={
              <tab.icon
                sx={{
                  color:
                    locationToTab(location).label === tab.label
                      ? tab.color
                      : undefined,
                }}
              />
            }
            aria-pressed={locationToTab(location).label === tab.label}
          >
            {tab.label}
          </Button>
        </Link>
      ))}
    </Stack>
  );
}

const Layout = {
  Tabs,
  MobileTabs,
  locationToTab,
  Root,
  Header,
  SideNav,
  SidePane,
  SideDrawer,
  Main,
};

export default Layout;
