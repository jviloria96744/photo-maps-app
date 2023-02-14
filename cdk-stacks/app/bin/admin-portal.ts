#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AdminSiteStack } from "../lib/stacks/admin-portal/admin-site-stack";
import { DOMAIN_NAMES, CONFIG, BUILD_DIRECTORIES } from "../config";
import * as path from "path";

const app = new cdk.App();

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
