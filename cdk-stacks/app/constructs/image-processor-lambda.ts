import * as lambda from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Stack, Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { lambdaBuildCommands } from "../config";

export interface ImageProcessorLambdaProps {
  codeDirectory: string;
  layerDirectories: string[];
}

export class ImageProcessorLambda extends Construct {
  constructor(parent: Stack, name: string, props: ImageProcessorLambdaProps) {
    super(parent, name);

    const { codeDirectory, layerDirectories } = props;

    const basePath = process.env.GITHUB_WORKSPACE || "";
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
      timeout: Duration.seconds(15),
    });

    const functionLayers = layerDirectories.map((layerDirectory) => {
      const layerPathName = path.resolve(
        basePath,
        "lambdas",
        "layers",
        layerDirectory
      );

      return new lambda.LayerVersion(this, `${name}-${layerDirectory}-layer`, {
        compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
        compatibleArchitectures: [lambda.Architecture.ARM_64],
        code: lambda.Code.fromAsset(layerPathName),
        removalPolicy: RemovalPolicy.RETAIN,
      });
    });

    baseFunction.addLayers(...functionLayers);

    const fnRole = baseFunction.role;

    new CfnOutput(this, `${name}-function-name`, {
      value: baseFunction.functionName,
    });
    new CfnOutput(this, `${name}-function-role-name`, {
      value: fnRole?.roleName || "roleName",
    });
  }
}
