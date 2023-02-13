import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

interface CertificateParameterStoreStackProps extends cdk.StackProps {
  certificates: {
    adminPortalCertificate: acm.Certificate;
    webClientCertificate: acm.Certificate;
    restApiCertificate: acm.Certificate;
    assetCDNCertificate: acm.Certificate;
    appSyncCertificate: acm.Certificate;
  };
}

type certificateStringType =
  | "adminPortal"
  | "webClient"
  | "restApi"
  | "assetCDN"
  | "appSync";

export class CertificateParameterStoreStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: CertificateParameterStoreStackProps
  ) {
    super(scope, id, props);
    const { certificates } = props;

    const certificateStrings: certificateStringType[] = [
      "adminPortal",
      "webClient",
      "restApi",
      "assetCDN",
      "appSync",
    ];
    const certificateParameters = certificateStrings.map((certString) => {
      return {
        id: certString,
        name: `certificates/${certString}/arn`,
        certificate: certificates[`${certString}Certificate`],
      };
    });

    certificateParameters.forEach((certParam) => {
      const { id, name, certificate } = certParam;
      new ssm.StringParameter(this, `${id}Parameter`, {
        parameterName: name,
        stringValue: certificate.certificateArn,
      });
    });
  }
}
