#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import { CertificateStack } from "../lib/stacks/certificate-stack";
import { CONFIG } from "../config";

const app = new cdk.App();

const { domainName, adminPortalSubDomain, webClientSubDomain, apiSubDomain } =
  CONFIG;

const certStack = new CertificateStack(app, "App", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
  crossRegionReferences: true,
  domainName,
  adminPortalSubDomain,
  webClientSubDomain,
  apiSubDomain,
});

const appStack = new AppStack(app, "App", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

appStack.addDependency(certStack);
