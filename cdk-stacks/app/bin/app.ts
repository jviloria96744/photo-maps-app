#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import {
  CertificateStack,
  CertificateParameterStoreStack,
  AdminSiteStack,
  AssetBucketStack,
  DynamoDbStack,
  ImageDeleterStack,
  ObservabilityStack,
  ImageProcessorStack,
  WebClientStack,
  AppApiStack,
} from "../lib/stacks";
import {
  DOMAIN_NAMES,
  CONFIG,
  BUILD_DIRECTORIES,
  PARAMETER_STORE_NAMES,
  OAUTH_GOOGLE_KEYS,
} from "../config";
import * as path from "path";

const app = new cdk.App();

const flagCertificate = app.node.tryGetContext("FLAG_CERTIFICATE");
const flagObservability = app.node.tryGetContext("FLAG_OBSERVABILITY");
const flagAdminPortal = app.node.tryGetContext("FLAG_ADMIN_PORTAL");
const flagStateful = app.node.tryGetContext("FLAG_STATEFUL");
const flagImageDeleter = app.node.tryGetContext("FLAG_IMAGE_DELETER");
const flagImageProcessor = app.node.tryGetContext("FLAG_IMAGE_PROCESSOR");
const flagWebClient = app.node.tryGetContext("FLAG_WEB_CLIENT");
const flagAppApi = app.node.tryGetContext("FLAG_APP_API");

if (flagObservability === "true") {
  const observabilityStack = new ObservabilityStack(app, "Observability", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    deadLetterQueueParameterStoreName: PARAMETER_STORE_NAMES.DEAD_LETTER_QUEUE,
  });
}

if (flagCertificate === "true") {
  const certStack = new CertificateStack(app, "Certificate", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: "us-east-1",
    },
    crossRegionReferences: true,
    domainName: DOMAIN_NAMES.TLD_NAME,
    adminPortalSubDomain: DOMAIN_NAMES.ADMIN_PORTAL_SUBDOMAIN,
    webClientSubDomain: DOMAIN_NAMES.WEBCLIENT_SUBDOMAIN,
    apiSubDomain: DOMAIN_NAMES.API_SUBDOMAIN,
    assetSubDomain: DOMAIN_NAMES.ASSETS_SUBDOMAIN,
    appSyncSubDomain: DOMAIN_NAMES.APPSYNC_SUBDOMAIN,
  });

  const certParameterStoreStack = new CertificateParameterStoreStack(
    app,
    "CertificateParameters",
    {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
      crossRegionReferences: true,
      certificates: {
        adminPortalCertificate: certStack.adminPortalCertificate,
        webClientCertificate: certStack.webClientCertificate,
        restApiCertificate: certStack.restApiCertificate,
        assetCDNCertificate: certStack.assetCDNCertificate,
        appSyncCertificate: certStack.appSyncCertificate,
      },
    }
  );

  certParameterStoreStack.addDependency(certStack);
}

if (flagAdminPortal === "true") {
  const adminPortalStack = new AdminSiteStack(app, "AdminPortal", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    siteDomain: `${DOMAIN_NAMES.ADMIN_PORTAL_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
    pathName: path.resolve(
      CONFIG.environment.basePath,
      BUILD_DIRECTORIES.ADMIN_PORTAL,
      BUILD_DIRECTORIES.STATIC_SITE_BUILD
    ),
    domainName: DOMAIN_NAMES.TLD_NAME,
    authCallbackUrls: CONFIG.adminPortal.callbackUrls,
    certificateParameterStoreName:
      PARAMETER_STORE_NAMES.ADMIN_PORTAL_CERTIFICATE,
  });
}

if (flagWebClient === "true") {
  const webClientStack = new WebClientStack(app, "WebClient", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    domainName: DOMAIN_NAMES.TLD_NAME,
    certificateParameterStoreName: PARAMETER_STORE_NAMES.WEB_CLIENT_CERTIFICATE,
    siteDomain: `${DOMAIN_NAMES.WEBCLIENT_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
    pathName: path.resolve(
      CONFIG.environment.basePath,
      BUILD_DIRECTORIES.WEB_CLIENT,
      BUILD_DIRECTORIES.STATIC_SITE_BUILD
    ),
    authCallbackUrls: CONFIG.webClient.callbackUrls,
    clientIdKey: OAUTH_GOOGLE_KEYS.CLIENT_ID_KEY,
    clientSecretKey: OAUTH_GOOGLE_KEYS.CLIENT_SECRET_KEY,
    userpoolParameterStoreName:
      PARAMETER_STORE_NAMES.WEB_CLIENT_COGNITO_USER_POOL,
  });
}

if (flagStateful === "true") {
  const assetBucketStack = new AssetBucketStack(app, "AssetBucket", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    tldDomainName: DOMAIN_NAMES.TLD_NAME,
    fullDomainName: `${DOMAIN_NAMES.ASSETS_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
    certificateParameterStoreName:
      PARAMETER_STORE_NAMES.ASSET_BUCKET_CERTIFICATE,
    deadLetterQueueParameterStoreName: PARAMETER_STORE_NAMES.DEAD_LETTER_QUEUE,
    assetBucketParameterStoreName: PARAMETER_STORE_NAMES.ASSET_BUCKET,
    deleteQueueParameterStoreName: PARAMETER_STORE_NAMES.DELETE_QUEUE,
    uploadQueueParameterStoreName: PARAMETER_STORE_NAMES.UPLOAD_QUEUE,
  });

  const dynamoDbStack = new DynamoDbStack(app, "DynamoDB", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    tableParameterStoreName: PARAMETER_STORE_NAMES.DYNAMODB_TABLE,
  });
}

if (flagImageDeleter === "true") {
  const imageDeleterStack = new ImageDeleterStack(app, "ImageDelete", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    dynamoTableParameterStoreName: PARAMETER_STORE_NAMES.DYNAMODB_TABLE,
    deleteQueueParameterStoreName: PARAMETER_STORE_NAMES.DELETE_QUEUE,
    Config: CONFIG,
  });
}

if (flagImageProcessor === "true") {
  const imageProcessorStack = new ImageProcessorStack(app, "ImageProcessor", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    assetBucketParameterStoreName: PARAMETER_STORE_NAMES.ASSET_BUCKET,
    dynamoTableParameterStoreName: PARAMETER_STORE_NAMES.DYNAMODB_TABLE,
    uploadQueueParameterStoreName: PARAMETER_STORE_NAMES.UPLOAD_QUEUE,
    Config: CONFIG,
  });
}

if (flagAppApi) {
  const appApiStack = new AppApiStack(app, "AppApi", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    dynamoTableParameterStoreName: PARAMETER_STORE_NAMES.DYNAMODB_TABLE,
    assetBucketParameterStoreName: PARAMETER_STORE_NAMES.ASSET_BUCKET,
    cognitoUserPoolParameterStoreName:
      PARAMETER_STORE_NAMES.WEB_CLIENT_COGNITO_USER_POOL,
    restApiCertificateParameterStoreName:
      PARAMETER_STORE_NAMES.REST_API_CERTIFICATE,
    Config: CONFIG,
    domainName: DOMAIN_NAMES.TLD_NAME,
    apiGatewayDomain: `${DOMAIN_NAMES.API_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
    appSyncCertificateParameterStoreName:
      PARAMETER_STORE_NAMES.APPSYNC_CERTIFICATE,
    appSyncDomain: DOMAIN_NAMES.APPSYNC_SUBDOMAIN,
    appSyncSchemaPathName: `${CONFIG.environment.basePath}/${CONFIG.websocket.pathName}`,
  });
}
