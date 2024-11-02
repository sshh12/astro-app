import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import GlobalStyles from "@mui/joy/GlobalStyles";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfigureLocationCard from "../components/ConfigureLocationCard";
import { theme } from "../theme/theme";

export default function OnboardingPage() {
  const { user, updateUser } = useBackend();
  const { closeOnboarding } = useBackend();
  const [loading, setLoading] = useState(false);
  const [triggerLocationSubmitCallback, setTriggerLocationSubmit] =
    useState(null);
  const navigate = useNavigate();
  return (
    <CssVarsProvider theme={theme} defaultMode="dark" disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ":root": {
            "--Form-maxWidth": "800px",
            "--Transition-duration": "0.4s", // set to `none` to disable transition
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: "100%", md: "50vw" },
          transition: "width var(--Transition-duration)",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "flex-end",
          backdropFilter: "blur(12px) brightness(20%)",
          backgroundColor: "rgba(19 19 24 / 0.4)",
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            width: "100%",
            px: 2,
          }}
        >
          <Box
            component="header"
            sx={{
              py: 3,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ gap: 2, display: "flex", alignItems: "center" }}>
              <IconButton
                variant="soft"
                sx={{ backgroundColor: "#111827" }}
                size="sm"
              >
                <AutoAwesomeIcon sx={{ color: "#e9b307" }} />
              </IconButton>
              <Typography level="title-lg">Astro App</Typography>
            </Box>
          </Box>
          <Box
            component="main"
            sx={{
              my: "auto",
              py: 2,
              pb: 5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: 400,
              maxWidth: "100%",
              mx: "auto",
              borderRadius: "sm",
              "& form": {
                display: "flex",
                flexDirection: "column",
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: "hidden",
              },
            }}
          >
            <Stack gap={43} sx={{ mb: 1 }}>
              <Stack gap={1}>
                <Typography component="h1" level="h3">
                  Welcome to the stars...
                </Typography>
                <Typography level="body-sm">
                  Explore the night sky and track celestial events.
                </Typography>
              </Stack>
            </Stack>
            <Stack gap={2} sx={{ mt: { xs: 0, sm: 2 } }}>
              <ConfigureLocationCard
                showButton={false}
                triggerSubmitAndCallback={triggerLocationSubmitCallback}
                onSubmit={(v) => {
                  updateUser("add_location", { location_details: v });
                }}
              />
              <Stack gap={2} sx={{ mt: 2 }}>
                <Button
                  loading={loading || !user}
                  fullWidth
                  onClick={() => {
                    setLoading(true);
                    setTriggerLocationSubmit(() => {
                      return () => {
                        setLoading(false);
                        closeOnboarding();
                        navigate("/tutorial");
                      };
                    });
                  }}
                >
                  Play Tutorial
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  loading={loading || !user}
                  onClick={() => {
                    setLoading(true);
                    setTriggerLocationSubmit(() => {
                      return () => {
                        setLoading(false);
                        closeOnboarding();
                        navigate("/sky");
                      };
                    });
                  }}
                >
                  Skip Tutorial
                </Button>
              </Stack>
            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" textAlign="center">
              © Astro App {new Date().getFullYear()} | Image: ESA/Hubble
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          height: "100%",
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: "50vw" },
          transition:
            "background-image var(--Transition-duration), left var(--Transition-duration) !important",
          transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
          backgroundColor: "background.level1",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundImage: "url(/static/hubble/jupiter.avif)",
        })}
      />
    </CssVarsProvider>
  );
}
