import { Stack, Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { NodeLambdaProps } from "./types";

export class NodeLambda extends Construct {
  function: NodejsFunction;
  constructor(parent: Stack, name: string, props: NodeLambdaProps) {
    super(parent, name);

    const { pathName, duration, memorySize, retryAttempts, environment } =
      props;

    const baseFunction = new NodejsFunction(this, `${name}Function`, {
      entry: `${pathName}/index.ts`,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      architecture: lambda.Architecture.X86_64,
      timeout: Duration.seconds(duration ?? 10),
      memorySize: memorySize ?? 128,
      retryAttempts: retryAttempts ?? 0,
      logRetention: logs.RetentionDays.ONE_MONTH,
      environment: {
        ...environment,
      },
      bundling: {
        minify: true,
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string) {
            return [`cd ${inputDir}`, "npm ci"];
          },
          beforeInstall() {
            return [];
          },
          afterBundling() {
            return [];
          },
        },
      },
      depsLockFilePath: `${pathName}/package-lock.json`,
      projectRoot: pathName,
    });

    this.function = baseFunction;
  }
}
