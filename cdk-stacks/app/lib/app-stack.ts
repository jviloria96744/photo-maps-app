import * as cdk from "aws-cdk-lib";
import { createStaticSiteProps } from "../config";
import { Construct } from "constructs";
import { StaticSite } from "../constructs/static-site";
import { AdminAuthFlow } from "../constructs/admin-auth-flow";
import { WebClientAuthFlow } from "../constructs/client-web-auth-flow";
import { ImageProcessorLambda } from "../constructs/image-processor-lambda";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const adminSiteProps = createStaticSiteProps("admin-portal");
    new StaticSite(this, "admin-site", adminSiteProps);

    const webPlatformProps = createStaticSiteProps("client-web");
    new StaticSite(this, "client-web", webPlatformProps);

    new AdminAuthFlow(this, "admin-auth-flow");

    new WebClientAuthFlow(this, "web-client-auth-flow");

    new ImageProcessorLambda(this, "image-processor", {
      codeDirectory: "image_processor",
      layerDirectories: ["boto3", "exifread", "reverse-geocode"],
    });
  }
}
