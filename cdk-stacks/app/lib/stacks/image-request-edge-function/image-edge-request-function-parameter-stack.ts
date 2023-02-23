import * as cdk from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ImageRequestEdgeFunctionParameterStackProps extends cdk.StackProps {
  edgeFunctionVersion: lambda.Version;
  functionVersionParameterStoreName: string;
}
export class ImageRequestEdgeFunctionParameterStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ImageRequestEdgeFunctionParameterStackProps
  ) {
    super(scope, id, props);

    const { edgeFunctionVersion, functionVersionParameterStoreName } = props;

    new ssm.StringParameter(this, `FunctionVersionParameter`, {
      parameterName: functionVersionParameterStoreName,
      stringValue: edgeFunctionVersion.edgeArn,
    });
  }
}
