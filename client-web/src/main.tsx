import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { Amplify } from "aws-amplify";
import { amplifyConfigurationOptions, graphqlConfiguration } from "./config";
import { ProvideAuth } from "./hooks/use-auth";
import { ProvideLocation } from "./hooks/use-location";
import { ProvideMedia } from "./hooks/use-media";
import "./index.css";

Amplify.configure({
  ...amplifyConfigurationOptions,
  ...graphqlConfiguration,
});

// Amplify.Logger.LOG_LEVEL = "DEBUG";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ProvideLocation>
    <ProvideMedia>
      <ProvideAuth>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </ProvideAuth>
    </ProvideMedia>
  </ProvideLocation>
);
