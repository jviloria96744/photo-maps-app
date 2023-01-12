import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Stack, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { lambdaBuildCommands } from "../config";

export interface ImageProcessorLambdaProps {
  codeDirectory: string;
}

export class ImageProcessorLambda extends Construct {
  constructor(parent: Stack, name: string, props: ImageProcessorLambdaProps) {
    super(parent, name);

    const { codeDirectory } = props;

    const basePath = process.env.GITHUB_WORKSPACE || "";
    const pathName = path.resolve(basePath, "lambdas", codeDirectory);
    const layerPath = path.resolve(
      basePath,
      "lambdas",
      "layers",
      "reverse-geocode"
    );

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
      layers: [
        new lambda.LayerVersion(parent, `${name}-layer`, {
          code: lambda.Code.fromAsset(layerPath),
          compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
          compatibleArchitectures: [lambda.Architecture.ARM_64],
        }),
      ],
    });

    const fnRole = baseFunction.role;

    fnRole?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["rekognition:DetectLabels"],
        resources: ["*"],
      })
    );

    new CfnOutput(this, `${name}-function-name`, {
      value: baseFunction.functionName,
    });
    new CfnOutput(this, `${name}-function-role-name`, {
      value: fnRole?.roleName || "roleName",
    });
  }
}
