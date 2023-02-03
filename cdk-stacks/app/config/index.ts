import { ImageProcessorLambda, ImageLambda, AppLambda } from "./interfaces";

export enum DOMAIN_NAMES {
  TLD_NAME = "jviloria.com",
  WEBCLIENT_SUBDOMAIN = "photo-maps-app",
  ADMIN_PORTAL_SUBDOMAIN = "admin-portal.photo-maps-app",
  API_SUBDOMAIN = "api.photo-maps-app",
  ASSETS_SUBDOMAIN = "assets.photo-maps-app",
  APPSYNC_SUBDOMAIN = "api.ws.photo-maps-app",
}

export enum BUILD_DIRECTORIES {
  STATIC_SITE_BUILD = "dist",
  ADMIN_PORTAL = "admin-portal",
  WEB_CLIENT = "client-web",
}

export enum OAUTH_GOOGLE_KEYS {
  CLIENT_ID_KEY = "/oauth/google-client-id",
  CLIENT_SECRET_KEY = "sandbox/idp_google",
}

enum LOG_LEVELS {
  INFO = "INFO",
}

enum IMAGE_PROCESSOR_SECRETS {
  KEY = "REVERSE_GEOCODE_API_KEY",
  NAME = "sandbox/photo-maps-app/secrets",
}

const removeTests = "rm -rf /asset-output/tests";
const removeDevRequirements = "rm -f requirements_dev.txt";
const removeEventsDirectory = "rm -rf /asset-output/events";
const removeStatements = `${removeTests} && ${removeDevRequirements} && ${removeEventsDirectory}`;

export interface IConfig {
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
    imageProcessor: ImageProcessorLambda;
    imageDeleter: ImageLambda;
    appServer: AppLambda;
    buildCommands: string[];
  };
  websocket: {
    pathName: string;
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
    imageProcessor: {
      codeDirectory: "image_processor",
      imageProcessorSecretName: IMAGE_PROCESSOR_SECRETS.NAME,
      imageProcessorSecretKey: IMAGE_PROCESSOR_SECRETS.KEY,
      duration: 15,
      memorySize: 512,
      batchSize: 1,
      maxConcurrency: 300,
      logLevel: LOG_LEVELS.INFO,
    },
    imageDeleter: {
      codeDirectory: "image_deleter",
      batchSize: 1,
      maxConcurrency: 50,
      duration: 15,
      logLevel: LOG_LEVELS.INFO,
    },
    appServer: {
      codeDirectory: "app_server",
      logLevel: LOG_LEVELS.INFO,
    },
    buildCommands: [
      "bash",
      "-c",
      `pip install -r requirements.txt -t /asset-output && cp -au . /asset-output && ${removeStatements}`,
    ],
  },
  websocket: {
    pathName: "client-web/schema.graphql",
  },
};
