import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";
import { S3ToSQS } from "../../constructs/s3-to-sqs";
import {
  PythonLambda,
  PythonLambdaProps,
} from "../../constructs/python-lambda";

interface ImageProcessorWorkflowStackProps extends cdk.NestedStackProps {
  dynamoTable: dynamodb.Table;
}

export class ImageProcessorWorkflowStack extends cdk.NestedStack {
  assetBucket: S3ToSQS;
  imageProcessorLambda: lambda.Function;
  imageProcessorRole: iam.IRole;
  imageDeleterLambda: lambda.Function;
  imageDeleterRole: iam.IRole;

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

    const imageProcessorProps: PythonLambdaProps = {
      codeDirectory: "image_processor",
      basePath,
      duration: 15,
      memorySize: 512,
      environment: {
        IMAGE_PROCESSOR_SECRET_NAME: imageProcessorSecretName,
        IMAGE_PROCESSOR_SECRET_KEY: imageProcessorSecretKey,
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: "INFO",
        POWERTOOLS_SERVICE_NAME: "image_processor",
      },
    };
    const imageProcessor = new PythonLambda(
      this,
      `${id}-lambda`,
      imageProcessorProps
    );

    imageProcessor.fnRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["rekognition:DetectLabels"],
        resources: ["*"],
      })
    );

    assetBucket.bucket.grantRead(imageProcessor.fnRole);
    lambdaSecrets.grantRead(imageProcessor.fnRole);
    dynamoTable.grantReadWriteData(imageProcessor.fnRole);

    const imageProcessorEventTrigger = new SqsEventSource(assetBucket.queue, {
      batchSize: 1,
    });

    imageProcessor.function.addEventSource(imageProcessorEventTrigger);

    const imageDeleterProps: PythonLambdaProps = {
      codeDirectory: "image_deleter",
      basePath,
      duration: 15,
      environment: {
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: "INFO",
        POWERTOOLS_SERVICE_NAME: "image_deleter",
      },
    };

    const imageDeleter = new PythonLambda(
      this,
      `${id}-delete-lambda`,
      imageDeleterProps
    );

    dynamoTable.grantReadWriteData(imageDeleter.fnRole);

    const imageDeleterEventTrigger = new SqsEventSource(
      assetBucket.deleteQueue,
      {
        batchSize: 1,
      }
    );

    imageDeleter.function.addEventSource(imageDeleterEventTrigger);

    this.assetBucket = assetBucket;
    this.imageProcessorLambda = imageProcessor.function;
    this.imageProcessorRole = imageProcessor.fnRole;
    this.imageDeleterLambda = imageDeleter.function;
    this.imageDeleterRole = imageDeleter.fnRole;
  }
}
