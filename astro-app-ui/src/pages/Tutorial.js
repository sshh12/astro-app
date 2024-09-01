import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { AspectRatio, LinearProgress } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import GlobalStyles from "@mui/joy/GlobalStyles";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { theme } from "../theme/theme";

const STEPS = [
  {
    title: "Track the sky",
    desc: "Collect your favorite objects to see where they'll be in the sky tonight. The 'altitude' of an object refers to how high it is in the sky (90° is straight up), while the 'azimuth' refers to its direction (e.g. North). Images are rendered to the same focal length of your equipment.",
    screenshot: "/static/screenshots/sky.png",
    background: "/static/hubble/spiral.avif",
  },
  {
    title: "Find new objects",
    desc: "Use AI-powered search to find objects personalized to your location and equipment. Just describe what you are interested in and let the app do the rest.",
    screenshot: "/static/screenshots/search.png",
    background: "/static/hubble/spiral.avif",
  },
  {
    title: "Monitor stargazing conditions",
    desc: "Track nightly weather conditions, light pollution, and events.",
    screenshot: "/static/screenshots/weather.png",
    background: "/static/hubble/spiral.avif",
  },
  {
    title: "Analyze your astro images",
    desc: "Upload images taken with your equipment or smartphone to identify objects in the sky.",
    screenshot: "/static/screenshots/analyze.png",
    background: "/static/hubble/spiral.avif",
  },
  {
    title: "Telescope Remote Control (Experimental)",
    desc: "For more advanced users that use N.I.N.A. you can control your telescope over the internet by installing the Astro App N.I.N.A. plugin.",
    screenshot: "/static/screenshots/nina.png",
    background: "/static/hubble/spiral.avif",
  },
];

export default function TutorialPage() {
  const location = useLocation();
  const stepId = parseInt(new URLSearchParams(location.search).get("s")) || 0;
  const step = STEPS[stepId];
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
              width: { sx: "100%", md: "80%", lg: "600px" },
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
                  {step.title}
                </Typography>
                <Typography level="body-sm">{step.desc}</Typography>
              </Stack>
            </Stack>
            <Stack gap={2} sx={{ mt: { xs: 0, sm: 2 } }}>
              <AspectRatio ratio={2048 / 1200}>
                <img src={step.screenshot} alt={step.desc} />
              </AspectRatio>
              <Stack gap={2} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  onClick={() => {
                    if (stepId === STEPS.length - 1) {
                      navigate("/sky");
                    } else {
                      navigate(`/tutorial?s=${stepId + 1}`);
                    }
                  }}
                >
                  Next
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    if (stepId === 0) {
                      navigate("/onboarding");
                    } else {
                      navigate(`/tutorial?s=${stepId - 1}`);
                    }
                  }}
                >
                  Back
                </Button>
                <LinearProgress
                  determinate
                  value={((stepId + 1) / STEPS.length) * 100}
                />
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
          backgroundImage: `url(${step.background})`,
        })}
      />
    </CssVarsProvider>
  );
}
