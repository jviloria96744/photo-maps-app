import { Stack } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { StaticSite } from "../static-site";
import { AdminAuthFlow } from "./admin-auth-flow";
import { Construct } from "constructs";

interface AdminStaticSiteProps {
  siteDomain: string;
  pathName: string;
  certificate: acm.ICertificate;
  hostedZone: route53.IHostedZone;
  authCallbackUrls: string[];
}

export class AdminStaticSite extends Construct {
  adminSite: StaticSite;
  adminAuthFlow: AdminAuthFlow;
  constructor(parent: Stack, name: string, props: AdminStaticSiteProps) {
    super(parent, name);
    const adminSite = new StaticSite(parent, name, props);

    const adminAuthFlow = new AdminAuthFlow(parent, `${name}-Auth`, {
      authCallbackUrls: props.authCallbackUrls,
    });

    this.adminSite = adminSite;
    this.adminAuthFlow = adminAuthFlow;
  }
}
