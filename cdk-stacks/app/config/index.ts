export enum DOMAIN_NAMES {
  TLD_NAME = "jviloria.com",
  WEBCLIENT_SUBDOMAIN = "photo-maps-app",
  ADMIN_PORTAL_SUBDOMAIN = "admin-portal.photo-maps-app",
  API_SUBDOMAIN = "api.photo-maps-app",
}

export enum BUILD_DIRECTORIES {
  STATIC_SITE_BUILD = "dist",
  ADMIN_PORTAL = "admin-portal",
  WEB_CLIENT = "client-web",
}

// export const webClientCallbackUrls: string[] = [
//   "http://localhost:5173/",
//   "http://localhost:3000/",
//   `https://${subDomain}.${domainName}/`,
// ];

const removeTests = "rm -rf /asset-output/tests";
const removeDevRequirements = "rm -f requirements_dev.txt";
const removeEventsDirectory = "rm -rf /asset-output/events";
const removeStatements = `${removeTests} && ${removeDevRequirements} && ${removeEventsDirectory}`;

// export const lambdaBuildCommands = [
//   "bash",
//   "-c",
//   `pip install -r requirements.txt -t /asset-output && cp -au . /asset-output && ${removeStatements}`,
// ];

interface IConfig {
  environment: {
    basePath: string;
  };
  adminPortal: {
    callbackUrls: string[];
  };
  webClient: {
    callbackUrls: string[];
  };
  pythonLambdas: {
    buildCommands: string[];
  };
}

export const CONFIG: IConfig = {
  environment: {
    basePath: process.env.GITHUB_WORKSPACE || "",
  },
  adminPortal: {
    callbackUrls: [
      "http://localhost:5173/",
      `https://${DOMAIN_NAMES.ADMIN_PORTAL_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}/`,
    ],
  },
  webClient: {
    callbackUrls: [
      "http://localhost:5173/",
      "http://localhost:3000/",
      `https://${DOMAIN_NAMES.WEBCLIENT_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}/`,
    ],
  },
  pythonLambdas: {
    buildCommands: [
      "bash",
      "-c",
      `pip install -r requirements.txt -t /asset-output && cp -au . /asset-output && ${removeStatements}`,
    ],
  },
};
