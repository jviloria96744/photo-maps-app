import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { StaticSite } from "../../../constructs/static-site";
import { AdminAuthFlow } from "../../../constructs/admin-portal/admin-auth-flow";
import { lookupResource } from "../../../utils/utils";

interface AdminSiteStackProps extends cdk.StackProps {
  siteDomain: string;
  domainName: string;
  pathName: string;
  authCallbackUrls: string[];
  certificateParameterStoreName: string;
}

export class AdminSiteStack extends cdk.Stack {
  adminSite: StaticSite;
  adminAuthFlow: AdminAuthFlow;
  constructor(scope: Construct, id: string, props: AdminSiteStackProps) {
    super(scope, id, props);
    const {
      domainName,
      siteDomain,
      pathName,
      authCallbackUrls,
      certificateParameterStoreName,
    } = props;
    const zone = route53.HostedZone.fromLookup(this, `HostedZone`, {
      domainName: domainName,
    });

    const adminPortalCertificate = lookupResource(
      this,
      "AdminPortalCertificate",
      certificateParameterStoreName,
      acm.Certificate.fromCertificateArn
    );

    const adminSite = new StaticSite(this, "StaticSite", {
      siteDomain,
      pathName,
      certificate: adminPortalCertificate,
      hostedZone: zone,
    });

    const adminAuthFlow = new AdminAuthFlow(this, "Auth", {
      authCallbackUrls,
    });

    this.adminSite = adminSite;
    this.adminAuthFlow = adminAuthFlow;
  }
}
