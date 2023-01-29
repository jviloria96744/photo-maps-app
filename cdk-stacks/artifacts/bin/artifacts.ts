#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ArtifactsStack } from "../lib/artifacts-stack";

const app = new cdk.App();
new ArtifactsStack(app, "ArtifactsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
