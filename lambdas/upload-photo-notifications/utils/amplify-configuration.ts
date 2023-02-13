import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { getSecret } from "./secrets";
import { ENV } from "./environment";

const client = new SecretsManagerClient({ region: ENV.AWS_REGION });

export const getAmplifyConfiguration = async () => {
  const apiKey = await getSecret(ENV.SECRET_NAME, ENV.SECRET_KEY, client);
  const amplifyConfiguration = {
    aws_appsync_graphqlEndpoint: ENV.APPSYNC_API_URL,
    aws_appsyn_region: ENV.AWS_REGION,
    aws_appsync_authenticationType: ENV.APPSYNC_AUTH_TYPE,
    aws_appsync_apiKey: apiKey,
  };

  return amplifyConfiguration;
};
