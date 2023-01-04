import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StaticSite, StaticSiteProps } from "../constructs/static-site";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = "jviloria.com";
    const subDomain = "photo-maps-app";
    const siteBuildDirectory = "dist";

    const adminSiteProps: StaticSiteProps = {
      domainName,
      siteSubDomain: `admin-portal.${subDomain}`,
      siteBuildDirectory,
      siteDirectory: "admin-portal",
    };
    new StaticSite(this, "admin-site", adminSiteProps);

    const webPlatformProps: StaticSiteProps = {
      domainName,
      siteSubDomain: subDomain,
      siteBuildDirectory,
      siteDirectory: "client-web",
    };

    new StaticSite(this, "client-web", webPlatformProps);
  }
}
