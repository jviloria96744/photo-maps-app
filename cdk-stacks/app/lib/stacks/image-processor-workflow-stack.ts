import * as cdk from "aws-cdk-lib";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { ImageProcessorLambda } from "../../constructs/image-processor-lambda";

export class ImageProcessorWorkflowStack extends cdk.NestedStack {
  imageProcessorLambda: ImageProcessorLambda;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const basePath = process.env.GITHUB_WORKSPACE || "";
    const imageProcessorSecretName =
      process.env.IMAGE_PROCESSOR_SECRET_NAME || "";
    const imageProcessorSecretKey =
      process.env.IMAGE_PROCESSOR_SECRET_KEY || "";
    const secretName = process.env.SECRET_NAME || "";

    const imageProcessorLambda = new ImageProcessorLambda(this, id, {
      basePath,
      codeDirectory: "image_processor",
      imageProcessorSecretName,
      imageProcessorSecretKey,
    });

    const lambdaSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      `${id}-secret`,
      secretName
    );

    lambdaSecrets.grantRead(imageProcessorLambda.fnRole);

    this.imageProcessorLambda = imageProcessorLambda;
  }
}
