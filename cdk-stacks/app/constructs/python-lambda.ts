import { Stack, Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as path from "path";
import { lambdaBuildCommands } from "../config";

export type LambdaEnvironmentType = {
  [key: string]: string;
};

export interface PythonLambdaProps {
  codeDirectory: string;
  basePath: string;
  duration?: number;
  memorySize?: number;
  environment: LambdaEnvironmentType;
  retryAttempts?: number;
}

export class PythonLambda extends Construct {
  function: lambda.Function;
  fnRole: iam.IRole;
  constructor(parent: Stack, name: string, props: PythonLambdaProps) {
    super(parent, name);

    const {
      codeDirectory,
      basePath,
      duration,
      memorySize,
      environment,
      retryAttempts,
    } = props;
    const pathName = path.resolve(basePath, "lambdas", codeDirectory);

    const baseFunction = new lambda.Function(this, `${name}-function`, {
      code: lambda.Code.fromAsset(pathName, {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: lambdaBuildCommands,
        },
      }),
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: "app.handler",
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(duration ?? 30),
      memorySize: memorySize ?? 128,
      environment: {
        ...environment,
      },
      retryAttempts: retryAttempts ?? 0,
    });

    const fnRole = baseFunction.role as iam.IRole;

    this.function = baseFunction;
    this.fnRole = fnRole;
  }
}
