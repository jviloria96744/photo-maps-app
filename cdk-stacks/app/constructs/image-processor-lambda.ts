import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Stack, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { lambdaBuildCommands } from "../config";

export interface ImageProcessorLambdaProps {
  codeDirectory: string;
  basePath: string;
  imageProcessorSecretName: string;
  imageProcessorSecretKey: string;
}

export class ImageProcessorLambda extends Construct {
  function: lambda.Function;
  fnRole: iam.IRole;

  constructor(parent: Stack, name: string, props: ImageProcessorLambdaProps) {
    super(parent, name);

    const {
      codeDirectory,
      basePath,
      imageProcessorSecretName,
      imageProcessorSecretKey,
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
      timeout: Duration.seconds(15),
      environment: {
        IMAGE_PROCESSOR_SECRET_NAME: imageProcessorSecretName,
        IMAGE_PROCESSOR_SECRET_KEY: imageProcessorSecretKey,
      },
    });

    const fnRole = baseFunction.role as iam.IRole;

    fnRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["rekognition:DetectLabels"],
        resources: ["*"],
      })
    );

    this.function = baseFunction;
    this.fnRole = fnRole;
  }
}
