import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Stack from "@mui/joy/Stack";
import { CssVarsProvider } from "@mui/joy/styles";
import React, { useState } from "react";
import AcknowledgementsCard from "../components/AcknowledgementsCard";
import ConfigureEquipmentCard from "../components/ConfigureEquipmentCard";
import FeedbackCard from "../components/FeedbackCard";
import { Header } from "../components/Headers";
import Layout from "../components/Layout";
import ProfileEquipmentCard from "../components/ProfileEquipmentCard";
import ProfileLocationCard from "../components/ProfileLocationCard";
import { SideBarNav } from "../components/Sidebars";
import { theme } from "../theme/theme";
import ConfigureLocationCard from "./../components/ConfigureLocationCard";

export default function ProfilePage() {
  const { user, updateUser } = useBackend();
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);

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
          <SideBarNav title="Profile" items={[]} />
        </Layout.SideNav>
        <Layout.Main>
          <Box sx={{ flex: 1, width: "100%", p: 0 }}>
            <Stack
              spacing={{ xs: 1, md: 3 }}
              sx={{
                display: "flex",
                maxWidth: "800px",
                mx: "auto",
                px: { xs: 0, md: 6 },
                py: { xs: 0, md: 3 },
              }}
            >
              <ProfileLocationCard setOpen={setOpenLocationDialog} />
              <ProfileEquipmentCard setOpen={setOpenEquipmentDialog} />
              <FeedbackCard />
              <AcknowledgementsCard />
            </Stack>
          </Box>
          <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
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
      <Modal
        open={openEquipmentDialog}
        onClose={() => setOpenEquipmentDialog(false)}
      >
        <ModalDialog sx={{ p: 0 }}>
          <ModalClose />
          <ConfigureEquipmentCard
            onSubmit={(v) => {
              updateUser("add_equipment", { equipment_details: v });
              setOpenEquipmentDialog(false);
            }}
          />
        </ModalDialog>
      </Modal>
    </CssVarsProvider>
  );
}
