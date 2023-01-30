import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

interface CertificateStackProps extends cdk.StackProps {
  domainName: string;
  adminPortalSubDomain: string;
  webClientSubDomain: string;
  apiSubDomain: string;
}
export class CertificateStack extends cdk.Stack {
  adminPortalCertificate: acm.Certificate;
  webClientCertificate: acm.Certificate;
  restApiCertificate: acm.Certificate;
  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const {
      domainName,
      adminPortalSubDomain,
      webClientSubDomain,
      apiSubDomain,
    } = props;

    const zone = route53.HostedZone.fromLookup(this, `${id}-HostedZone`, {
      domainName: domainName,
    });

    const adminPortalCertificate = new acm.Certificate(
      this,
      `${id}-AdminPortal-Cert`,
      {
        domainName: `${adminPortalSubDomain}.${domainName}`,
        validation: acm.CertificateValidation.fromDns(zone),
      }
    );

    const webClientCertificate = new acm.Certificate(
      this,
      `${id}-WebClient-Cert`,
      {
        domainName: `${webClientSubDomain}.${domainName}`,
        validation: acm.CertificateValidation.fromDns(zone),
      }
    );

    const restApiCertificate = new acm.Certificate(this, `${id}-RestApi-Cert`, {
      domainName: `${apiSubDomain}.${domainName}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    this.adminPortalCertificate = adminPortalCertificate;
    this.webClientCertificate = webClientCertificate;
    this.restApiCertificate = restApiCertificate;
  }
}
