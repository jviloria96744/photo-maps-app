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

    const stepFunction = new ImageUploadStepFunction(this, id, {
      bucket: assetBucket.bucket,
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
    assetBucket.bucket.grantRead(stepFunctionOrchestrator.fnRole);

    const imageManifestEventTrigger = new SqsEventSource(assetBucket.queue, {
      batchSize: Config.pythonLambdas.stepFunctionOrchestrator.batchSize,
      maxConcurrency:
        Config.pythonLambdas.stepFunctionOrchestrator.maxConcurrency,
    });

    stepFunctionOrchestrator.function.addEventSource(imageManifestEventTrigger);

    // const imageProcessorEventTrigger = new SqsEventSource(assetBucket.queue, {
    //   batchSize: Config.pythonLambdas.imageProcessor.batchSize,
    //   maxConcurrency: Config.pythonLambdas.imageProcessor.maxConcurrency,
    // });

    // imageProcessor.function.addEventSource(imageProcessorEventTrigger);

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
    this.imageProcessorLambda = imageProcessor.function;
    this.imageProcessorRole = imageProcessor.fnRole;
    this.imageDeleterLambda = imageDeleter.function;
    this.imageDeleterRole = imageDeleter.fnRole;
  }

  private createPathName(basePath: string, codeDirectory: string): string {
    return path.resolve(basePath, "lambdas", codeDirectory);
  }
}
