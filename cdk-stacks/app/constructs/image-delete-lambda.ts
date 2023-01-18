import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Stack, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { lambdaBuildCommands } from "../config";

export interface ImageDeleteLambdaProps {
  codeDirectory: string;
  basePath: string;
  deleteQueue: sqs.Queue;
  dynamoTable: dynamodb.Table;
}

export class ImageDeleteLambda extends Construct {
  function: lambda.Function;
  fnRole: iam.IRole;

  constructor(parent: Stack, name: string, props: ImageDeleteLambdaProps) {
    super(parent, name);

    const { codeDirectory, basePath, deleteQueue, dynamoTable } = props;

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
      memorySize: 128,
      environment: {
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: "INFO",
        POWERTOOLS_SERVICE_NAME: "image_deleter",
      },
      retryAttempts: 0,
    });

    const fnRole = baseFunction.role as iam.IRole;

    dynamoTable.grantReadWriteData(fnRole);

    const sqsEventTrigger = new SqsEventSource(deleteQueue, {
      batchSize: 1,
    });

    baseFunction.addEventSource(sqsEventTrigger);

    this.function = baseFunction;
    this.fnRole = fnRole;
  }
}
