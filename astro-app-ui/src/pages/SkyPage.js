import * as React from "react";
import { useLocation } from "react-router-dom";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Layout from "../components/Layout";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { theme } from "../theme/theme";
import SkySummarySheet from "../components/SkySummarySheet";

export default function SkyPage() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  return (
    <CssVarsProvider theme={theme} disableTransitionOnChange>
      <CssBaseline />
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <SideBar />
        </Layout.SideDrawer>
      )}
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
          py: 2,
          backgroundColor: "background.body",
          borderTop: "1px solid",
          borderColor: "divider",
          marginX: "calc(1 * var(--joy-spacing))",
          paddingBottom: "calc(1 * var(--joy-spacing))",
          paddingTop: "calc(1 * var(--joy-spacing))",
        }}
      >
        {Layout.Tabs.map((tab) => (
          <Button
            key={tab.label}
            variant="plain"
            color="neutral"
            component="a"
            href={tab.href}
            size="sm"
            startDecorator={
              <tab.icon
                sx={{
                  color:
                    Layout.locationToTab(location).label === tab.label
                      ? tab.color
                      : undefined,
                }}
              />
            }
            aria-pressed={Layout.locationToTab(location).label === tab.label}
            sx={{
              flexDirection: "column",
              "--Button-gap": 0,
              flex: 1,
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Stack>
      <Layout.Root
        sx={{
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(64px, 200px) minmax(450px, 1fr)",
            md: "minmax(160px, 300px) minmax(600px, 1fr) minmax(300px, 420px)",
          },
          ...(drawerOpen && {
            height: "100vh",
            overflow: "hidden",
          }),
        }}
      >
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <SideBar />
        </Layout.SideNav>
        <Layout.Main>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 2,
            }}
          >
            <SkySummarySheet />
            {Array.from({ length: 10 }).map((_, index) => (
              <Card variant="outlined" size="sm">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="title-md">
                      lotr-two-towers.pdf
                    </Typography>
                    <Typography level="body-sm">132.2MB</Typography>
                  </Box>
                  <Dropdown>
                    <MenuButton
                      variant="plain"
                      size="sm"
                      sx={{
                        maxWidth: "32px",
                        maxHeight: "32px",
                        borderRadius: "9999999px",
                      }}
                    >
                      <IconButton
                        component="span"
                        variant="plain"
                        color="neutral"
                        size="sm"
                      >
                        <MoreVertRoundedIcon />
                      </IconButton>
                    </MenuButton>
                    <Menu
                      placement="bottom-end"
                      size="sm"
                      sx={{
                        zIndex: "99999",
                        p: 1,
                        gap: 1,
                        "--ListItem-radius": "var(--joy-radius-sm)",
                      }}
                    >
                      <MenuItem>
                        <EditRoundedIcon />
                        Rename file
                      </MenuItem>
                      <MenuItem>
                        <ShareRoundedIcon />
                        Share file
                      </MenuItem>
                      <MenuItem sx={{ textColor: "danger.500" }}>
                        <DeleteRoundedIcon color="danger" />
                        Delete file
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </Box>
                <CardOverflow
                  sx={{
                    borderBottom: "1px solid",
                    borderTop: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                  }}
                >
                  <AspectRatio
                    ratio="16/9"
                    color="primary"
                    sx={{ borderRadius: 0 }}
                  >
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=400&auto=format"
                      srcSet="https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=400&auto=format&dpr=2 2x"
                    />
                  </AspectRatio>
                </CardOverflow>
                <Typography level="body-xs">Added 27 Jun 2023</Typography>
              </Card>
            ))}
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  );
}
