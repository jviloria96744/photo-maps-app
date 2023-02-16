#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import {
  CertificateStack,
  CertificateParameterStoreStack,
} from "../lib/stacks/certificates";
import { AdminSiteStack } from "../lib/stacks/admin-portal/admin-site-stack";
import { AssetBucketStack } from "../lib/stacks/asset-bucket/asset-bucket-stack";
import { DynamoDbStack } from "../lib/stacks/dynamodb/dynamodb-stack";
import { ImageDeleterStack } from "../lib/stacks/image-deleter/image-deleter-stack";
import { ObservabilityStack } from "../lib/stacks/observability/observability-stack";
import { ImageProcessorStack } from "../lib/stacks/image-processor/image-processor-stack";
import {
  DOMAIN_NAMES,
  CONFIG,
  BUILD_DIRECTORIES,
  PARAMETER_STORE_NAMES,
} from "../config";
import * as path from "path";

const app = new cdk.App();

const flagCertificate = app.node.tryGetContext("FLAG_CERTIFICATE");
const flagObservability = app.node.tryGetContext("FLAG_OBSERVABILITY");
const flagAdminPortal = app.node.tryGetContext("FLAG_ADMIN_PORTAL");
const flagStateful = app.node.tryGetContext("FLAG_STATEFUL");
const flagImageDeleter = app.node.tryGetContext("FLAG_IMAGE_DELETER");
const flagImageProcessor = app.node.tryGetContext("FLAG_IMAGE_PROCESSOR");

if (flagObservability === "true") {
  const observabilityStack = new ObservabilityStack(app, "Observability", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
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

// const certStack = new CertificateStack(app, "Certificate", {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: "us-east-1",
//   },
//   crossRegionReferences: true,
//   domainName: DOMAIN_NAMES.TLD_NAME,
//   adminPortalSubDomain: DOMAIN_NAMES.ADMIN_PORTAL_SUBDOMAIN,
//   webClientSubDomain: DOMAIN_NAMES.WEBCLIENT_SUBDOMAIN,
//   apiSubDomain: DOMAIN_NAMES.API_SUBDOMAIN,
//   assetSubDomain: DOMAIN_NAMES.ASSETS_SUBDOMAIN,
//   appSyncSubDomain: DOMAIN_NAMES.APPSYNC_SUBDOMAIN,
// });

// const certParameterStoreStack = new CertificateParameterStoreStack(
//   app,
//   "CertificateParameters",
//   {
//     env: {
//       account: process.env.CDK_DEFAULT_ACCOUNT,
//       region: process.env.CDK_DEFAULT_REGION,
//     },
//     crossRegionReferences: true,
//     certificates: {
//       adminPortalCertificate: certStack.adminPortalCertificate,
//       webClientCertificate: certStack.webClientCertificate,
//       restApiCertificate: certStack.restApiCertificate,
//       assetCDNCertificate: certStack.assetCDNCertificate,
//       appSyncCertificate: certStack.appSyncCertificate,
//     },
//   }
// );

// certParameterStoreStack.addDependency(certStack);

// const appStack = new AppStack(app, "App", {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
//   crossRegionReferences: true,
//   certificates: {
//     adminPortalCertificate: certStack.adminPortalCertificate,
//     webClientCertificate: certStack.webClientCertificate,
//     restApiCertificate: certStack.restApiCertificate,
//     assetCDNCertificate: certStack.assetCDNCertificate,
//     appSyncCertificate: certStack.appSyncCertificate,
//     hostedZone: certStack.hostedZone,
//   },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });

// appStack.addDependency(certStack);
