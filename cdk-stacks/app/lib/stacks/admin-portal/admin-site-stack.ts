import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { StaticSite } from "../../../constructs/static-site";
import { AdminAuthFlow } from "../../../constructs/admin-portal/admin-auth-flow";

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

    const adminPortalCertificate = this.lookupCertificate(
      certificateParameterStoreName
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
  private lookupCertificate(certName: string): acm.ICertificate {
    const certArn = ssm.StringParameter.fromStringParameterName(
      this,
      `${certName}Arn`,
      `/certificates/${certName}/arn`
    );
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      `${certName}Certificate`,
      certArn.stringValue
    );

    return certificate;
  }
}
