import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";
import { IConfig } from "../../../config";
import {
  PythonLambda,
  PythonLambdaProps,
} from "../../../constructs/lambda-functions";
import { createPathName, lookupResource } from "../../../utils/utils";

interface ImageDeleterStackProps extends cdk.StackProps {
  dynamoTableParameterStoreName: string;
  deleteQueueParameterStoreName: string;
  Config: IConfig;
}

export class ImageDeleterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImageDeleterStackProps) {
    super(scope, id, props);
    const {
      Config,
      dynamoTableParameterStoreName,
      deleteQueueParameterStoreName,
    } = props;

    const dynamoTable = lookupResource(
      this,
      "DynamoTable",
      dynamoTableParameterStoreName,
      dynamodb.Table.fromTableArn
    );
    const deleteQueue = lookupResource(
      this,
      "DeleteQueue",
      deleteQueueParameterStoreName,
      sqs.Queue.fromQueueArn
    );

    const imageDeleterProps: PythonLambdaProps = {
      pathName: createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.imageDeleter.codeDirectory
      ),
      duration: Config.pythonLambdas.imageDeleter.duration,
      environment: {
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: Config.pythonLambdas.imageDeleter.logLevel,
        POWERTOOLS_SERVICE_NAME:
          Config.pythonLambdas.imageDeleter.codeDirectory,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    };

    const imageDeleter = new PythonLambda(
      this,
      "DeleterLambda",
      imageDeleterProps
    );

    dynamoTable.grantReadWriteData(imageDeleter.fnRole);

    const imageDeleterEventTrigger = new SqsEventSource(deleteQueue, {
      batchSize: Config.pythonLambdas.imageDeleter.batchSize,
      maxConcurrency: Config.pythonLambdas.imageDeleter.maxConcurrency,
    });

    imageDeleter.function.addEventSource(imageDeleterEventTrigger);
  }
}
