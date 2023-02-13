import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

interface CertificateLookupStackProps extends cdk.StackProps {
  domainName: string;
}

export class CertificateLookupStack extends cdk.Stack {
  adminPortalCertificate: acm.ICertificate;
  webClientCertificate: acm.ICertificate;
  restApiCertificate: acm.ICertificate;
  assetCDNCertificate: acm.ICertificate;
  appSyncCertificate: acm.ICertificate;
  hostedZone: route53.IHostedZone;
  constructor(
    scope: Construct,
    id: string,
    props: CertificateLookupStackProps
  ) {
    super(scope, id, props);
    const { domainName } = props;

    const zone = route53.HostedZone.fromLookup(this, `${id}HostedZone`, {
      domainName: domainName,
    });

    const adminPortalCertificate = this.lookupCertificate("AdminPortal");
    const webClientCertificate = this.lookupCertificate("WebClient");
    const restApiCertificate = this.lookupCertificate("restApi");
    const assetCDNCertificate = this.lookupCertificate("assetCDN");
    const appSyncCertificate = this.lookupCertificate("appSync");

    this.adminPortalCertificate = adminPortalCertificate;
    this.webClientCertificate = webClientCertificate;
    this.restApiCertificate = restApiCertificate;
    this.assetCDNCertificate = assetCDNCertificate;
    this.appSyncCertificate = appSyncCertificate;
    this.hostedZone = zone;
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
