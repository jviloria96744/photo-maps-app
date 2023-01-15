import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StaticSite } from "../../constructs/static-site";
import { AdminAuthFlow } from "../../constructs/admin-auth-flow";
import { createStaticSiteProps } from "../../config";

export class AdminSiteStack extends cdk.NestedStack {
  adminSite: StaticSite;
  adminAuthFlow: AdminAuthFlow;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const adminSiteProps = createStaticSiteProps("admin-portal");
    const adminSite = new StaticSite(this, id, adminSiteProps);

    const adminAuthFlow = new AdminAuthFlow(this, "admin-auth-flow");

    this.adminSite = adminSite;
    this.adminAuthFlow = adminAuthFlow;
  }
}
