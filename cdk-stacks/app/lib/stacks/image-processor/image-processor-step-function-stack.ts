import * as cdk from "aws-cdk-lib";
import * as step_functions from "aws-cdk-lib/aws-stepfunctions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";
import { PythonLambda, NodeLambda } from "../../../constructs/lambda-functions";
import { ImageUploadStepFunction } from "../../../constructs/step-functions/image-upload-step-function";
import { IConfig } from "../../../config";
import { createPathName } from "../../../utils/utils";

interface ImageProcessorStepFunctionStackProps extends cdk.NestedStackProps {
  imageGeotaggerLambda: PythonLambda;
  imageLabelFilterLambda: PythonLambda;
  appsyncMessengerLambda: NodeLambda;
  dynamoTable: dynamodb.ITable;
  Config: IConfig;
  uploadQueue: sqs.IQueue;
}

export class ImageProcessorStepFunctionStack extends cdk.NestedStack {
  constructor(
    scope: Construct,
    id: string,
    props: ImageProcessorStepFunctionStackProps
  ) {
    super(scope, id, props);

    const {
      imageGeotaggerLambda,
      imageLabelFilterLambda,
      appsyncMessengerLambda,
      dynamoTable,
      Config,
      uploadQueue,
    } = props;

    const stepFunction = new ImageUploadStepFunction(this, id, {
      imageLabelFilterLambda,
      imageGeotaggerLambda,
      appsyncMessengerLambda,
      dynamoTable,
    });

    const stepFunctionOrchestrator = this.createStepFunctionOrchestratorLambda(
      Config,
      stepFunction.machine
    );

    const imageManifestEventTrigger = new SqsEventSource(uploadQueue, {
      batchSize: Config.pythonLambdas.stepFunctionOrchestrator.batchSize,
      maxConcurrency:
        Config.pythonLambdas.stepFunctionOrchestrator.maxConcurrency,
    });

    stepFunctionOrchestrator.function.addEventSource(imageManifestEventTrigger);

    stepFunction.machine.grantStartExecution(stepFunctionOrchestrator.function);
  }

  private createStepFunctionOrchestratorLambda(
    Config: IConfig,
    machine: step_functions.StateMachine
  ): PythonLambda {
    return new PythonLambda(this, "SFOrchestratorLambda", {
      pathName: createPathName(
        Config.environment.basePath,
        Config.pythonLambdas.stepFunctionOrchestrator.codeDirectory
      ),
      duration: Config.pythonLambdas.stepFunctionOrchestrator.duration,
      environment: {
        LOG_LEVEL: Config.pythonLambdas.stepFunctionOrchestrator.logLevel,
        POWERTOOLS_SERVICE_NAME:
          Config.pythonLambdas.stepFunctionOrchestrator.codeDirectory,
        STATE_MACHINE_ARN: machine.stateMachineArn,
      },
      lambdaBuildCommands: Config.pythonLambdas.buildCommands,
    });
  }
}
