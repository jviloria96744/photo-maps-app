import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import * as path from "path";

export function createPathName(
  basePath: string,
  codeDirectory: string
): string {
  return path.resolve(basePath, "lambdas", codeDirectory);
}

type LookupFunctionType<T> = (
  scope: Construct,
  resourceId: string,
  arn: string
) => T;

export function lookupResource<T>(
  scope: Construct,
  resourceId: string,
  arnLookupValue: string,
  lookupFunction: LookupFunctionType<T>
): T {
  const resourceArn = ssm.StringParameter.fromStringParameterName(
    scope,
    `${resourceId}Arn`,
    arnLookupValue
  );

  const resource = lookupFunction(
    scope,
    `${resourceId}Lookup`,
    resourceArn.stringValue
  );

  return resource;
}
