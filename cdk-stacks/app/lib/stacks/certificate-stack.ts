import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

interface CertificateStackProps extends cdk.StackProps {
  domainName: string;
  adminPortalSubDomain: string;
  webClientSubDomain: string;
  apiSubDomain: string;
  assetSubDomain: string;
  appSyncSubDomain: string;
}
export class CertificateStack extends cdk.Stack {
  adminPortalCertificate: acm.Certificate;
  webClientCertificate: acm.Certificate;
  restApiCertificate: acm.Certificate;
  assetCDNCertificate: acm.Certificate;
  appSyncCertificate: acm.Certificate;
  hostedZone: route53.IHostedZone;
  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const {
      domainName,
      adminPortalSubDomain,
      webClientSubDomain,
      apiSubDomain,
      assetSubDomain,
      appSyncSubDomain,
    } = props;

    const zone = route53.HostedZone.fromLookup(this, `${id}-HostedZone`, {
      domainName: domainName,
    });

    const adminPortalCertificate = new acm.Certificate(
      this,
      `${id}-AdminPortal`,
      {
        domainName: `${adminPortalSubDomain}.${domainName}`,
        validation: acm.CertificateValidation.fromDns(zone),
      }
    );

    const webClientCertificate = new acm.Certificate(this, `${id}-WebClient`, {
      domainName: `${webClientSubDomain}.${domainName}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const restApiCertificate = new acm.Certificate(this, `${id}-RestApi`, {
      domainName: `${apiSubDomain}.${domainName}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const assetCDNCertificate = new acm.Certificate(this, `${id}-AssetCDN`, {
      domainName: `${assetSubDomain}.${domainName}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const appSyncCertificate = new acm.Certificate(this, `${id}-AppSync`, {
      domainName: `${appSyncSubDomain}.${domainName}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    this.adminPortalCertificate = adminPortalCertificate;
    this.webClientCertificate = webClientCertificate;
    this.restApiCertificate = restApiCertificate;
    this.assetCDNCertificate = assetCDNCertificate;
    this.appSyncCertificate = appSyncCertificate;
    this.hostedZone = zone;
  }
}
