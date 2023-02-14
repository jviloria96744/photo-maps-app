import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { AdminStaticSite } from "../../../constructs/admin-portal/admin-static-site";

interface AdminSiteStackProps extends cdk.StackProps {
  siteDomain: string;
  domainName: string;
  pathName: string;
  authCallbackUrls: string[];
}

export class AdminSiteStack extends cdk.Stack {
  adminStaticSite: AdminStaticSite;
  constructor(scope: Construct, id: string, props: AdminSiteStackProps) {
    super(scope, id, props);
    const { domainName, siteDomain, pathName, authCallbackUrls } = props;
    const zone = route53.HostedZone.fromLookup(this, `HostedZone`, {
      domainName: domainName,
    });

    const adminPortalCertificate = this.lookupCertificate("AdminPortal");

    const adminStaticSite = new AdminStaticSite(this, `StaticSite`, {
      siteDomain,
      pathName,
      certificate: adminPortalCertificate,
      hostedZone: zone,
      authCallbackUrls: authCallbackUrls,
    });

    this.adminStaticSite = adminStaticSite;
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
