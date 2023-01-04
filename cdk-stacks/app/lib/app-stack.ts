import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StaticSite, StaticSiteProps } from "../constructs/static-site";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const adminSiteProps: StaticSiteProps = {
      domainName: "jviloria.com",
      siteSubDomain: "admin-portal.photo-maps-app",
      siteBuildDirectory: "dist",
      siteDirectory: "admin-portal",
    };
    new StaticSite(this, "admin-site", adminSiteProps);
  }
}
