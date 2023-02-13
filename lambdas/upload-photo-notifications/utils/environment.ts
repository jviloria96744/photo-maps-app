interface IEnvironment {
  AWS_REGION: string;
  APPSYNC_API_URL: string;
  APPSYNC_AUTH_TYPE: string;
  SECRET_NAME: string;
  SECRET_KEY: string;
}

export const ENV: IEnvironment = {
  AWS_REGION: process.env.AWS_REGION || "",
  APPSYNC_API_URL: process.env.APPSYNC_API_URL || "",
  APPSYNC_AUTH_TYPE: process.env.APPSYNC_AUTH_TYPE || "",
  SECRET_NAME: process.env.SECRET_NAME || "",
  SECRET_KEY: process.env.SECRET_KEY || "",
};
