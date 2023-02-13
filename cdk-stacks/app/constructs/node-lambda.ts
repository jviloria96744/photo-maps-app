import { Stack, Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export interface NodeLambdaProps {
  entry: string;
  codePath: string;
  duration?: number;
  memorySize?: number;
  retryAttempts?: number;
  environment: {
    [key: string]: string;
  };
}
export class NodeLambda extends Construct {
  function: NodejsFunction;
  constructor(parent: Stack, name: string, props: NodeLambdaProps) {
    super(parent, name);

    const {
      entry,
      codePath,
      duration,
      memorySize,
      retryAttempts,
      environment,
    } = props;

    const baseFunction = new NodejsFunction(this, `${name}Function`, {
      entry,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(duration ?? 10),
      memorySize: memorySize ?? 128,
      retryAttempts: retryAttempts ?? 0,
      environment: {
        ...environment,
      },
      depsLockFilePath: codePath,
      bundling: {
        minify: true,
      },
      projectRoot: codePath,
    });

    this.function = baseFunction;
  }
}
