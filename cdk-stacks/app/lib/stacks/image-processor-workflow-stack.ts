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
import { IConfig } from "../../config";
import * as path from "path";

interface ImageProcessorWorkflowStackProps extends cdk.NestedStackProps {
  dynamoTable: dynamodb.Table;
  Config: IConfig;
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

    const { dynamoTable, Config } = props;

    const assetBucket = new S3ToSQS(this, "Assets");

    const lambdaSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      "Secret",
      Config.pythonLambdas.imageProcessor.imageProcessorSecretName
    );

    const imageProcessorProps: PythonLambdaProps = {
      pathName: this.createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.imageProcessor.codeDirectory
      ),
      duration: Config.pythonLambdas.imageProcessor.duration,
      memorySize: Config.pythonLambdas.imageProcessor.memorySize,
      environment: {
        IMAGE_PROCESSOR_SECRET_NAME:
          Config.pythonLambdas.imageProcessor.imageProcessorSecretName,
        IMAGE_PROCESSOR_SECRET_KEY:
          Config.pythonLambdas.imageProcessor.imageProcessorSecretKey,
        DDB_TABLE_NAME: dynamoTable.tableName,
        LOG_LEVEL: Config.pythonLambdas.imageProcessor.logLevel,
        POWERTOOLS_SERVICE_NAME:
          Config.pythonLambdas.imageProcessor.codeDirectory,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    };
    const imageProcessor = new PythonLambda(
      this,
      "ProcessorLambda",
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
      batchSize: Config.pythonLambdas.imageProcessor.batchSize,
      maxConcurrency: Config.pythonLambdas.imageProcessor.maxConcurrency,
    });

    imageProcessor.function.addEventSource(imageProcessorEventTrigger);

    const imageDeleterProps: PythonLambdaProps = {
      pathName: this.createPathName(
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

    const imageDeleterEventTrigger = new SqsEventSource(
      assetBucket.deleteQueue,
      {
        batchSize: Config.pythonLambdas.imageDeleter.batchSize,
        maxConcurrency: Config.pythonLambdas.imageDeleter.maxConcurrency,
      }
    );

    imageDeleter.function.addEventSource(imageDeleterEventTrigger);

    this.assetBucket = assetBucket;
    this.imageProcessorLambda = imageProcessor.function;
    this.imageProcessorRole = imageProcessor.fnRole;
    this.imageDeleterLambda = imageDeleter.function;
    this.imageDeleterRole = imageDeleter.fnRole;
  }

  private createPathName(basePath: string, codeDirectory: string): string {
    return path.resolve(basePath, "lambdas", codeDirectory);
  }
}
