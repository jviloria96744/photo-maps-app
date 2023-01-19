import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonLambda, PythonLambdaProps } from "./python-lambda";

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

    const lambdaConstructProps: PythonLambdaProps = {
      codeDirectory,
      basePath,
      duration: 15,
      environment: {
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

    dynamoTable.grantReadWriteData(lambdaConstruct.fnRole);

    const sqsEventTrigger = new SqsEventSource(deleteQueue, {
      batchSize: 1,
    });

    lambdaConstruct.function.addEventSource(sqsEventTrigger);

    this.function = lambdaConstruct.function;
    this.fnRole = lambdaConstruct.fnRole;
  }
}
