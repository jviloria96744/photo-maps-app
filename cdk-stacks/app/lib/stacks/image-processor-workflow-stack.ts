import * as cdk from "aws-cdk-lib";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { ImageProcessorLambda } from "../../constructs/image-processor-lambda";
import { S3ToSQS } from "../../constructs/s3-to-sqs";

interface ImageProcessorWorkflowStackProps extends cdk.NestedStackProps {
  dynamoTable: dynamodb.Table;
}

export class ImageProcessorWorkflowStack extends cdk.NestedStack {
  assetBucket: S3ToSQS;
  imageProcessorLambda: ImageProcessorLambda;
  constructor(
    scope: Construct,
    id: string,
    props: ImageProcessorWorkflowStackProps
  ) {
    super(scope, id, props);

    const { dynamoTable } = props;

    const assetBucket = new S3ToSQS(this, `${id}-asset`);

    const basePath = process.env.GITHUB_WORKSPACE || "";
    const imageProcessorSecretName =
      process.env.IMAGE_PROCESSOR_SECRET_NAME || "";
    const imageProcessorSecretKey =
      process.env.IMAGE_PROCESSOR_SECRET_KEY || "";

    const lambdaSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      `${id}-secret`,
      imageProcessorSecretName
    );

    const imageProcessorLambda = new ImageProcessorLambda(
      this,
      `${id}-lambda`,
      {
        basePath,
        codeDirectory: "image_processor",
        imageProcessorSecretName,
        imageProcessorSecretKey,
        bucket: assetBucket.bucket,
        queue: assetBucket.queue,
        secrets: lambdaSecrets,
        dynamoTable,
      }
    );

    this.imageProcessorLambda = imageProcessorLambda;
  }
}
