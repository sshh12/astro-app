import { extendTheme } from "@mui/joy/styles";

export const theme = extendTheme({
  palette: {
    mode: "dark",
  },
  colorSchemes: {
    light: {
      palette: {
        // Dark red theme for astronomy
        primary: {
          50: "#2a0808", // Darkest
          100: "#3d0f0f",
          200: "#4f1515",
          300: "#611b1b",
          400: "#742121",
          500: "#862727", // Main primary
          600: "#983030",
          700: "#aa3636",
          800: "#bc3c3c",
          900: "#ce4242", // Lightest
          plainColor: "#862727",
          plainHoverBg: "#3d0f0f",
          plainActiveBg: "#2a0808",
          plainDisabledColor: "#4f1515",
        },
        neutral: {
          50: "#1a0404", // Darkest
          100: "#2a0808",
          200: "#3d0f0f",
          300: "#4f1515",
          400: "#611b1b",
          500: "#742121", // Main neutral
          600: "#862727",
          700: "#983030",
          800: "#aa3636",
          900: "#bc3c3c", // Lightest
          plainColor: "#742121",
          plainHoverBg: "#3d0f0f",
          plainActiveBg: "#2a0808",
          plainDisabledColor: "#4f1515",
        },
        danger: {
          50: "#2a0808",
          100: "#3d0f0f",
          200: "#4f1515",
          300: "#611b1b",
          400: "#742121",
          500: "#862727",
          600: "#983030",
          700: "#aa3636",
          800: "#bc3c3c",
          900: "#ce4242",
          plainColor: "#862727",
          plainHoverBg: "#3d0f0f",
          plainActiveBg: "#2a0808",
          plainDisabledColor: "#4f1515",
        },
        background: {
          body: "#2a0808",
          surface: "#1a0404",
          popup: "#1a0404",
          level1: "#2a0808",
          level2: "#3d0f0f",
          level3: "#4f1515",
        },
        common: {
          white: "#ce4242", // Lightest red instead of white
          black: "#1a0404", // Darkest red instead of black
        },
        text: {
          primary: "#ce4242",
          secondary: "#983030",
          tertiary: "#742121",
        },
      },
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
