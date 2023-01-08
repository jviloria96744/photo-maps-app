import * as cdk from "aws-cdk-lib";
import { createStaticSiteProps } from "../config";
import { Construct } from "constructs";
import { StaticSite } from "../constructs/static-site";
import { AdminAuthFlow } from "../constructs/admin-auth-flow";
import { WebClientAuthFlow } from "../constructs/client-web-auth-flow";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const adminSiteProps = createStaticSiteProps("admin-portal");
    new StaticSite(this, "admin-site", adminSiteProps);

    const webPlatformProps = createStaticSiteProps("client-web");
    new StaticSite(this, "client-web", webPlatformProps);

    new AdminAuthFlow(this, "admin-auth-flow");

    new WebClientAuthFlow(this, "web-client-auth-flow");
  }
}
