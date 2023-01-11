import * as lambda from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Stack, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { lambdaBuildCommands } from "../config";

export interface LambdaFunctionProps {
  codeDirectory: string;
}

export class LambdaFunction extends Construct {
  constructor(parent: Stack, name: string, props: LambdaFunctionProps) {
    super(parent, name);

    const basePath = process.env.GITHUB_WORKSPACE || "";
    const pathName = path.resolve(basePath, "lambdas", props.codeDirectory);

    const fn = new lambda.Function(this, `${name}-function`, {
      code: lambda.Code.fromAsset(pathName, {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: lambdaBuildCommands,
        },
      }),
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: "app.handler",
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(15),
    });

    const fnRole = fn.role;

    new CfnOutput(this, `${name}-function-name`, { value: fn.functionName });
    new CfnOutput(this, `${name}-function-role-name`, {
      value: fnRole?.roleName || "roleName",
    });
  }
}
