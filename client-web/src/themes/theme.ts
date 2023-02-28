import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#FFFFFF",
    },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "1em",
        },
      },
    },
  },
});
