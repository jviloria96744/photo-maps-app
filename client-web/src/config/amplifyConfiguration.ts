import { ENV } from "./environment";

export const amplifyConfigurationOptions = {
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: ENV.VITE_AWS_REGION,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: ENV.VITE_USERPOOL_ID,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: ENV.VITE_USERPOOL_WEB_CLIENT_ID,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: `${ENV.VITE_COGNITO_DOMAIN}.auth.${ENV.VITE_AWS_REGION}.amazoncognito.com`,
      scope: ["email", "profile", "openid", "aws.cognito.signin.user.admin"],
      redirectSignIn: `${window.location.origin}/`,
      redirectSignOut: `${window.location.origin}/`,
      responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
    },
  },
};
