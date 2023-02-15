#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import {
  CertificateStack,
  CertificateParameterStoreStack,
} from "../lib/stacks/certificates";
import { AdminSiteStack } from "../lib/stacks/admin-portal/admin-site-stack";
import { DOMAIN_NAMES, CONFIG, BUILD_DIRECTORIES } from "../config";
import * as path from "path";

const app = new cdk.App();

const flagCertificate = app.node.tryGetContext("FLAG_CERTIFICATE");
const flagAdminPortal = app.node.tryGetContext("FLAG_ADMIN_PORTAL");

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
      CONFIG.adminPortal.certificateParameterStoreName,
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
