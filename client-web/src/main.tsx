import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { Amplify } from "aws-amplify";
import { ProvideAuth, amplifyConfigurationOptions } from "./hooks/use-auth";
import "./index.css";

Amplify.configure(amplifyConfigurationOptions);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ProvideAuth>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </ProvideAuth>
);
