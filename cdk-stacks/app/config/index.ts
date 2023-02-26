import {
  ImageGeotaggerLambda,
  ImageLambda,
  AppLambda,
  AppsyncMessengerLambda,
} from "./interfaces";

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

export enum PARAMETER_STORE_NAMES {
  DEAD_LETTER_QUEUE = "/queue/app-dlq/arn",
  ASSET_BUCKET = "/bucket/assets/arn",
  DELETE_QUEUE = "/queue/delete-queue/arn",
  UPLOAD_QUEUE = "/queue/upload-queue/arn",
  DYNAMODB_TABLE = "/dynamodb/app-db/arn",
  ASSET_BUCKET_CERTIFICATE = "/certificates/assetCDN/arn",
  ADMIN_PORTAL_CERTIFICATE = "/certificates/adminPortal/arn",
  WEB_CLIENT_CERTIFICATE = "/certificates/webClient/arn",
  WEB_CLIENT_COGNITO_USER_POOL = "/userpool/webclient/arn",
  REST_API_CERTIFICATE = "/certificates/restApi/arn",
  APPSYNC_CERTIFICATE = "/certificates/appSync/arn",
  IMAGE_REQUEST_EDGE_FUNCTION = "/function/imageRequestEdgeFunction/arn",
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
    imageGeotagger: ImageGeotaggerLambda;
    imageDeleter: ImageLambda;
    imageLabelFilter: AppLambda;
    appServer: AppLambda;
    stepFunctionOrchestrator: ImageLambda;
    buildCommands: string[];
  };
  nodeLambdas: {
    appsyncMessenger: AppsyncMessengerLambda;
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
    imageGeotagger: {
      codeDirectory: "image_geotagger",
      imageProcessorSecretName: IMAGE_PROCESSOR_SECRETS.NAME,
      imageProcessorSecretKey: IMAGE_PROCESSOR_SECRETS.KEY,
      duration: 15,
      memorySize: 1024,
      logLevel: LOG_LEVELS.INFO,
    },
    imageDeleter: {
      codeDirectory: "image_deleter",
      batchSize: 1,
      maxConcurrency: 50,
      duration: 15,
      logLevel: LOG_LEVELS.INFO,
    },
    imageLabelFilter: {
      codeDirectory: "image_label_filter",
      logLevel: LOG_LEVELS.INFO,
    },
    appServer: {
      codeDirectory: "app_server",
      logLevel: LOG_LEVELS.INFO,
    },
    stepFunctionOrchestrator: {
      codeDirectory: "step_function_orchestrator",
      logLevel: LOG_LEVELS.INFO,
      batchSize: 10,
      maxConcurrency: 100,
      duration: 10,
    },
    buildCommands: [
      "bash",
      "-c",
      `pip install -r requirements.txt -t /asset-output && cp -au . /asset-output && ${removeStatements}`,
    ],
  },
  nodeLambdas: {
    appsyncMessenger: {
      codeDirectory: "upload-photo-notifications",
      logLevel: LOG_LEVELS.INFO,
      appSyncApiUrl: "https://api.ws.photo-maps-app.jviloria.com/graphql",
      appSyncAuthType: "API_KEY",
      apiKeySecretKey: "API_KEY",
      apiKeySecretName: "sandbox/appsync_api_key",
    },
  },
  websocket: {
    pathName: "client-web/schema.graphql",
  },
};
