import * as ssm from "aws-cdk-lib/aws-ssm";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import * as path from "path";

export function createPathName(
  basePath: string,
  codeDirectory: string
): string {
  return path.resolve(basePath, "lambdas", codeDirectory);
}

export function lookupCertificate(
  scope: Construct,
  certName: string
): acm.ICertificate {
  const certArn = ssm.StringParameter.fromStringParameterName(
    scope,
    `${certName}Arn`,
    `/certificates/${certName}/arn`
  );
  const certificate = acm.Certificate.fromCertificateArn(
    scope,
    `${certName}Certificate`,
    certArn.stringValue
  );

  return certificate;
}
