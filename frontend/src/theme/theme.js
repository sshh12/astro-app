import { extendTheme } from "@mui/joy/styles";

export const theme = extendTheme({
  palette: {
    mode: "dark",
  },
  colorSchemes: {
    light: {
      palette: {},
    },
    dark: {
      palette: {
        neutral: {
          900: "#111827",
          plainHoverBg: "#2a354b",
        },
        background: {
          body: "#1e293b",
        },
      },
    },
  },
});
