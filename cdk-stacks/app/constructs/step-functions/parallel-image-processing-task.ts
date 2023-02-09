import * as step_function from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as iam from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonLambda } from "../python-lambda";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ParallelImageProcessingTaskProps {
  imageLabelFilterLambda: PythonLambda;
  imageGeotaggerLambda: PythonLambda;
}

export class ParallelImageProcessingTask extends Construct {
  task: step_function.Parallel;
  constructor(
    parent: Stack,
    name: string,
    props: ParallelImageProcessingTaskProps
  ) {
    super(parent, name);

    const { imageLabelFilterLambda, imageGeotaggerLambda } = props;

    const parallelImageProcessingTask = new step_function.Parallel(
      this,
      "Run Image Processing Tasks",
      {
        comment:
          "The Geotagging and Rekognition steps are independent, therefore can be run in parallel",
        resultPath: "$.result",
      }
    );

    // Left Branch
    const geoTaggingTask = this.createLambdaInvokeTask(
      "Extract Geotag Data",
      imageGeotaggerLambda.function,
      "geoData"
    );
    // Left Branch

    // Right Branch
    const rekognitionBranch = this.createRekognitionTask();

    const imageLabelFilterTask = this.createLambdaInvokeTask(
      "Filter Image Labels",
      imageLabelFilterLambda.function,
      "labels"
    );

    rekognitionBranch.next(imageLabelFilterTask);
    // Right Branch

    parallelImageProcessingTask.branch(geoTaggingTask);
    parallelImageProcessingTask.branch(rekognitionBranch);

    this.task = parallelImageProcessingTask;
  }

  createLambdaInvokeTask(
    taskTitle: string,
    lambdaFunction: IFunction,
    resultSelectorKey: string
  ) {
    return new tasks.LambdaInvoke(this, taskTitle, {
      lambdaFunction: lambdaFunction,
      retryOnServiceExceptions: false,
      resultSelector: {
        [`${resultSelectorKey}.$`]: "$.Payload",
      },
      resultPath: "$.result",
    });
  }

  createRekognitionTask() {
    return new tasks.CallAwsService(this, "Detect Image Labels", {
      service: "rekognition",
      action: "detectLabels",
      parameters: {
        Features: ["GENERAL_LABELS"],
        Image: {
          S3Object: {
            "Bucket.$": "$.Bucket",
            "Name.$": "$.imageId",
          },
        },
      },
      iamResources: ["*"],
      additionalIamStatements: [
        new iam.PolicyStatement({
          actions: ["s3:getObject"],
          resources: ["*"],
        }),
      ],
      resultSelector: {
        "imageLabels.$": "$.Labels",
      },
      resultPath: "$.result",
    });
  }
}
