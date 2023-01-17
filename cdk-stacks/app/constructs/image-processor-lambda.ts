import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Stack, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { lambdaBuildCommands } from "../config";

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
        DDB_TABLE_NAME: dynamoTable.tableName,
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

    bucket.grantRead(fnRole);
    secrets.grantRead(fnRole);
    dynamoTable.grantReadWriteData(fnRole);

    const sqsEventTrigger = new SqsEventSource(queue, {
      batchSize: 1,
    });

    baseFunction.addEventSource(sqsEventTrigger);

    this.function = baseFunction;
    this.fnRole = fnRole;
  }
}
