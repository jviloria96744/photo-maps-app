import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonLambda, PythonLambdaProps } from "./python-lambda";

export interface ImageProcessorLambdaProps {
  codeDirectory: string;
  basePath: string;
  imageProcessorSecretName: string;
  imageProcessorSecretKey: string;
  bucket: s3.Bucket;
  queue: sqs.Queue;
  secrets: secretsmanager.ISecret;
  dynamoTable: dynamodb.Table;
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
      bucket,
      queue,
      secrets,
      dynamoTable,
    } = props;

    const lambdaConstructProps: PythonLambdaProps = {
      codeDirectory,
      basePath,
      duration: 15,
      memorySize: 512,
      environment: {
        IMAGE_PROCESSOR_SECRET_NAME: imageProcessorSecretName,
        IMAGE_PROCESSOR_SECRET_KEY: imageProcessorSecretKey,
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: "INFO",
        POWERTOOLS_SERVICE_NAME: name,
      },
    };
    const lambdaConstruct = new PythonLambda(
      parent,
      name,
      lambdaConstructProps
    );

    lambdaConstruct.fnRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["rekognition:DetectLabels"],
        resources: ["*"],
      })
    );

    bucket.grantRead(lambdaConstruct.fnRole);
    secrets.grantRead(lambdaConstruct.fnRole);
    dynamoTable.grantReadWriteData(lambdaConstruct.fnRole);

    const sqsEventTrigger = new SqsEventSource(queue, {
      batchSize: 1,
    });

    lambdaConstruct.function.addEventSource(sqsEventTrigger);

    this.function = lambdaConstruct.function;
    this.fnRole = lambdaConstruct.fnRole;
  }
}
