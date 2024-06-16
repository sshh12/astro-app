import React, { useState } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListSubheader from "@mui/joy/ListSubheader";
import Box from "@mui/joy/Box";
import Layout from "../components/Layout";
import { Header } from "../components/Headers";
import { theme } from "../theme/theme";
import { useBackend } from "../providers/backend";
import ConfigureLocationCard from "./../components/ConfigureLocationCard";
import Stack from "@mui/joy/Stack";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import ProfileLocationCard from "../components/ProfileLocationCard";

function SideBar() {
  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          Profile
        </ListSubheader>
        <List
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        ></List>
      </ListItem>
    </List>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useBackend();
  const [openLocationDialog, setOpenLocationDialog] = useState(false);

  return (
    <CssVarsProvider theme={theme} defaultMode="dark" disableTransitionOnChange>
      <CssBaseline />
      <Layout.MobileTabs />
      <Layout.Root
        sx={{
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(64px, 200px) minmax(450px, 1fr)",
          },
        }}
      >
        <Layout.Header>
          <Header
            title={"Profile"}
            subtitle={user ? "@" + user?.name : "@user"}
          />
        </Layout.Header>
        <Layout.SideNav>
          <SideBar />
        </Layout.SideNav>
        <Layout.Main>
          <Box sx={{ flex: 1, width: "100%", p: 0 }}>
            <Stack
              spacing={4}
              sx={{
                display: "flex",
                maxWidth: "800px",
                mx: "auto",
                px: { xs: 0, md: 6 },
                py: { xs: 0, md: 3 },
              }}
            >
              <ProfileLocationCard setOpen={setOpenLocationDialog} />
            </Stack>
          </Box>
        </Layout.Main>
      </Layout.Root>
      <Modal
        open={openLocationDialog}
        onClose={() => setOpenLocationDialog(false)}
      >
        <ModalDialog sx={{ p: 0 }}>
          <ModalClose />
          <ConfigureLocationCard
            onSubmit={(v) => {
              updateUser("add_location", { location_details: v });
              setOpenLocationDialog(false);
            }}
          />
        </ModalDialog>
      </Modal>
    </CssVarsProvider>
  );
}
