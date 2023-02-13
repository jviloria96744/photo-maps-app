import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const getSecret = async (
  secretName: string,
  secretKey: string,
  client: SecretsManagerClient
): Promise<string | any> => {
  try {
    const secretResponse = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    if (secretResponse.SecretString) {
      const secretParsed = JSON.parse(secretResponse.SecretString);
      return secretParsed[secretKey];
    } else {
      return null;
    }
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }
};
