import * as cdk from "aws-cdk-lib";
import { createStaticSiteProps } from "../config";
import { Construct } from "constructs";
import { StaticSite } from "../constructs/static-site";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const adminSiteProps = createStaticSiteProps("admin-portal");
    new StaticSite(this, "admin-site", adminSiteProps);

    const webPlatformProps = createStaticSiteProps("client-web");
    new StaticSite(this, "client-web", webPlatformProps);
  }
}
