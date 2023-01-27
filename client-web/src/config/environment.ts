interface IEnvironment {
  VITE_USERPOOL_ID: string;
  VITE_USERPOOL_WEB_CLIENT_ID: string;
  VITE_AWS_REGION: string;
  VITE_COGNITO_DOMAIN: string;
  VITE_BASE_API_URL: string;
}

export const ENV: IEnvironment = {
  VITE_USERPOOL_ID: import.meta.env.VITE_USERPOOL_ID,
  VITE_USERPOOL_WEB_CLIENT_ID: import.meta.env.VITE_USERPOOL_WEB_CLIENT_ID,
  VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
  VITE_COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN,
  VITE_BASE_API_URL: import.meta.env.VITE_BASE_API_URL,
};