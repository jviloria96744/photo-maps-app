import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
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
import { NodeLambda, NodeLambdaProps } from "../../constructs/node-lambda";
import { ImageUploadStepFunction } from "../../constructs/step-functions/image-upload-step-function";
import { IConfig } from "../../config";
import * as path from "path";

interface ImageProcessorWorkflowStackProps extends cdk.NestedStackProps {
  dynamoTable: dynamodb.Table;
  Config: IConfig;
  assetCDNCertificate: acm.Certificate;
  cdnDomain: string;
  hostedZone: route53.IHostedZone;
}

export class ImageProcessorWorkflowStack extends cdk.NestedStack {
  assetBucket: S3ToSQS;
  imageGeotaggerLambda: lambda.Function;
  imageGeotaggerRole: iam.IRole;
  imageDeleterLambda: lambda.Function;
  imageDeleterRole: iam.IRole;
  appsyncMessenger: NodeLambda;

  constructor(
    scope: Construct,
    id: string,
    props: ImageProcessorWorkflowStackProps
  ) {
    super(scope, id, props);

    const { dynamoTable, assetCDNCertificate, Config, cdnDomain, hostedZone } =
      props;

    const assetBucket = new S3ToSQS(this, "Assets", {
      certificate: assetCDNCertificate,
      domainName: cdnDomain,
      hostedZone: hostedZone,
    });

    const lambdaSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      "Secret",
      Config.pythonLambdas.imageGeotagger.imageProcessorSecretName
    );

    const imageGeotaggerProps: PythonLambdaProps = {
      pathName: this.createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.imageGeotagger.codeDirectory
      ),
      duration: Config.pythonLambdas.imageGeotagger.duration,
      memorySize: Config.pythonLambdas.imageGeotagger.memorySize,
      environment: {
        IMAGE_PROCESSOR_SECRET_NAME:
          Config.pythonLambdas.imageGeotagger.imageProcessorSecretName,
        IMAGE_PROCESSOR_SECRET_KEY:
          Config.pythonLambdas.imageGeotagger.imageProcessorSecretKey,
        LOG_LEVEL: Config.pythonLambdas.imageGeotagger.logLevel,
        POWERTOOLS_SERVICE_NAME:
          Config.pythonLambdas.imageGeotagger.codeDirectory,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    };
    const imageGeotagger = new PythonLambda(
      this,
      "GeotaggerLambda",
      imageGeotaggerProps
    );

    assetBucket.bucket.grantRead(imageGeotagger.fnRole);
    lambdaSecrets.grantRead(imageGeotagger.fnRole);

    const imageLabelFilterProps: PythonLambdaProps = {
      pathName: this.createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.imageLabelFilter.codeDirectory
      ),
      environment: {
        LOG_LEVEL: Config.pythonLambdas.imageLabelFilter.logLevel,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    };

    const imageLabelFilter = new PythonLambda(
      this,
      "ImageLabelFilterLambda",
      imageLabelFilterProps
    );

    const appsyncSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      "AppSyncSecret",
      Config.nodeLambdas.appsyncMessenger.apiKeySecretName
    );

    const appsyncMessengerLambdaProps: NodeLambdaProps = {
      entry: path.resolve(
        Config.environment.basePath,
        "lambdas",
        Config.nodeLambdas.appsyncMessenger.codeDirectory,
        "index.ts"
      ),
      codePath: this.createPathName(
        Config.environment.basePath,
        Config.nodeLambdas.appsyncMessenger.codeDirectory
      ),
      environment: {
        APPSYNC_API_URL: Config.nodeLambdas.appsyncMessenger.appSyncApiUrl,
        APPSYNC_AUTH_TYPE: Config.nodeLambdas.appsyncMessenger.appSyncAuthType,
        SECRET_NAME: Config.nodeLambdas.appsyncMessenger.apiKeySecretName,
        SECRET_KEY: Config.nodeLambdas.appsyncMessenger.apiKeySecretKey,
      },
    };

    const appsyncMessenger = new NodeLambda(
      this,
      "AppSyncMutaterLambda",
      appsyncMessengerLambdaProps
    );

    appsyncSecrets.grantRead(appsyncMessenger.function);

    const stepFunction = new ImageUploadStepFunction(this, id, {
      imageLabelFilterLambda: imageLabelFilter,
      imageGeotaggerLambda: imageGeotagger,
      appsyncMessengerLambda: appsyncMessenger,
      dynamoTable,
    });

    const stepFunctionOrchestratorProps: PythonLambdaProps = {
      pathName: this.createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.stepFunctionOrchestrator.codeDirectory
      ),
      duration: Config.pythonLambdas.stepFunctionOrchestrator.duration,
      environment: {
        LOG_LEVEL: Config.pythonLambdas.stepFunctionOrchestrator.logLevel,
        POWERTOOLS_SERVICE_NAME:
          Config.pythonLambdas.stepFunctionOrchestrator.codeDirectory,
        STATE_MACHINE_ARN: stepFunction.machine.stateMachineArn,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    };

    const stepFunctionOrchestrator = new PythonLambda(
      this,
      "SFOrchestratorLambda",
      stepFunctionOrchestratorProps
    );

    const imageManifestEventTrigger = new SqsEventSource(assetBucket.queue, {
      batchSize: Config.pythonLambdas.stepFunctionOrchestrator.batchSize,
      maxConcurrency:
        Config.pythonLambdas.stepFunctionOrchestrator.maxConcurrency,
    });

    stepFunctionOrchestrator.function.addEventSource(imageManifestEventTrigger);

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

    stepFunction.machine.grantStartExecution(stepFunctionOrchestrator.function);

    this.assetBucket = assetBucket;
    this.imageGeotaggerLambda = imageGeotagger.function;
    this.imageGeotaggerRole = imageGeotagger.fnRole;
    this.imageDeleterLambda = imageDeleter.function;
    this.imageDeleterRole = imageDeleter.fnRole;
    this.appsyncMessenger = appsyncMessenger;
  }

  private createPathName(basePath: string, codeDirectory: string): string {
    return path.resolve(basePath, "lambdas", codeDirectory);
  }
}
