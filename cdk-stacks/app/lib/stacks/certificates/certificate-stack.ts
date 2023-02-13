import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
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

    const adminPortalCertificate = this.createCertificate(
      adminPortalSubDomain,
      domainName,
      `${id}-AdminPortal`,
      zone
    );

    const webClientCertificate = this.createCertificate(
      webClientSubDomain,
      domainName,
      `${id}-WebClientPortal`,
      zone
    );

    const restApiCertificate = this.createCertificate(
      apiSubDomain,
      domainName,
      `${id}-RestApi`,
      zone
    );

    const assetCDNCertificate = this.createCertificate(
      assetSubDomain,
      domainName,
      `${id}-AssetCDN`,
      zone
    );

    const appSyncCertificate = this.createCertificate(
      appSyncSubDomain,
      domainName,
      `${id}-AppSync`,
      zone
    );

    this.adminPortalCertificate = adminPortalCertificate;
    this.webClientCertificate = webClientCertificate;
    this.restApiCertificate = restApiCertificate;
    this.assetCDNCertificate = assetCDNCertificate;
    this.appSyncCertificate = appSyncCertificate;
    this.hostedZone = zone;
  }

  private createCertificate(
    subdomain: string,
    domain: string,
    id: string,
    zone: IHostedZone
  ): acm.Certificate {
    const certificate = new acm.Certificate(this, id, {
      domainName: `${subdomain}.${domain}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    return certificate;
  }
}
