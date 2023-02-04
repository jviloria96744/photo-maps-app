import { ENV } from "./environment";

export const graphqlConfiguration = {
  aws_appsync_graphqlEndpoint: ENV.VITE_APPSYNC_API_URL,
  aws_appsync_region: ENV.VITE_AWS_REGION,
  aws_appsync_authenticationType: ENV.VITE_APPSYNC_AUTH_TYPE,
  aws_appsync_apiKey: ENV.VITE_APPSYNC_API_KEY,
};
