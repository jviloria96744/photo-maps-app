import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { StaticSite } from "../../constructs/static-site";
import { AdminAuthFlow } from "../../constructs/admin-auth-flow";

interface AdminSiteStackProps extends cdk.NestedStackProps {
  siteDomain: string;
  pathName: string;
  certificate: acm.Certificate;
  hostedZone: route53.IHostedZone;
}

export class AdminSiteStack extends cdk.NestedStack {
  adminSite: StaticSite;
  adminAuthFlow: AdminAuthFlow;
  constructor(scope: Construct, id: string, props: AdminSiteStackProps) {
    super(scope, id, props);

    const adminSite = new StaticSite(this, id, props);

    const adminAuthFlow = new AdminAuthFlow(this, `${id}-Auth`);

    this.adminSite = adminSite;
    this.adminAuthFlow = adminAuthFlow;
  }
}
