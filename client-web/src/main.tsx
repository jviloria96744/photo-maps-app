import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material";
import { Amplify } from "aws-amplify";
import { amplifyConfigurationOptions, graphqlConfiguration } from "./config";
import { ProvideAuth } from "./hooks/use-auth";
import { ProvideLocation } from "./hooks/use-location";
import { ProvideMedia } from "./hooks/use-media";
import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { appTheme } from "./themes/theme";

Amplify.configure({
  ...amplifyConfigurationOptions,
  ...graphqlConfiguration,
});

// Amplify.Logger.LOG_LEVEL = "DEBUG";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ProvideLocation>
    <ProvideMedia>
      <ProvideAuth>
        <ThemeProvider theme={appTheme}>
          <App />
        </ThemeProvider>
      </ProvideAuth>
    </ProvideMedia>
  </ProvideLocation>
);
