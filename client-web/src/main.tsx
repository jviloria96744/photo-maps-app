import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Amplify } from "aws-amplify";
import { amplifyConfigurationOptions, graphqlConfiguration } from "./config";
import { ProvideAuth } from "./hooks/use-auth";
import "./index.css";

Amplify.configure({
  ...amplifyConfigurationOptions,
  ...graphqlConfiguration,
});

Amplify.Logger.LOG_LEVEL = "DEBUG";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: Infinity,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ProvideAuth>
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  </ProvideAuth>
);
