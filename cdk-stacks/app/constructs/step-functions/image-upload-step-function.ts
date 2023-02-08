import * as step_function from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as iam from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonLambda } from "../python-lambda";

interface ImageUploadStepFunctionProps {
  imageLabelFilterLambda: PythonLambda;
  imageGeotaggerLambda: PythonLambda;
}

export class ImageUploadStepFunction extends Construct {
  machine: step_function.StateMachine;
  constructor(
    parent: Stack,
    name: string,
    props: ImageUploadStepFunctionProps
  ) {
    super(parent, name);

    const { imageLabelFilterLambda, imageGeotaggerLambda } = props;

    const getUploadManifest = new tasks.CallAwsService(
      this,
      "Get Photo Upload Manifest",
      {
        service: "s3",
        action: "getObject",
        parameters: {
          "Bucket.$": "$.bucket_name",
          "Key.$": "$.object_key",
        },
        iamResources: ["*"],
        resultSelector: {
          "manifestData.$": "States.StringToJson($.Body)",
        },
        resultPath: "$.result",
        comment:
          "Get manifest file from S3 to determine files that need to be processed",
      }
    );

    const mapImages = new step_function.Map(this, "Process Images", {
      parameters: {
        "Bucket.$": "$.bucket_name",
        "imageId.$": "$$.Map.Item.Value",
      },
      itemsPath: "$.result.manifestData.imageIds",
      resultPath: "$.result",
      maxConcurrency: 0,
    });

    const parallelImageProcessingTask = new step_function.Parallel(
      this,
      "Run Image Processing Tasks",
      {
        comment:
          "The Geotagging and Rekognition steps are independent, therefore can be run in parallel",
      }
    );

    const geoTaggingTask = new tasks.LambdaInvoke(this, "Extract Geotag Data", {
      lambdaFunction: imageGeotaggerLambda.function,
      retryOnServiceExceptions: false,
      resultSelector: {
        "geoData.$": "$.Payload",
      },
      resultPath: "$.result",
    });

    parallelImageProcessingTask.branch(geoTaggingTask);

    const rekognitionBranch = new tasks.CallAwsService(
      this,
      "Detect Image Labels",
      {
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
      }
    );

    const imageLabelFilterTask = new tasks.LambdaInvoke(
      this,
      "Filter Image Labels",
      {
        lambdaFunction: imageLabelFilterLambda.function,
        retryOnServiceExceptions: false,
        resultSelector: {
          "labels.$": "$.Payload",
        },
        resultPath: "$.result",
      }
    );

    rekognitionBranch.next(imageLabelFilterTask);

    parallelImageProcessingTask.branch(rekognitionBranch);

    mapImages.iterator(parallelImageProcessingTask);

    const definition = getUploadManifest.next(mapImages);

    const machine = new step_function.StateMachine(this, "StateMachine", {
      definition,
      // stateMachineType: step_function.StateMachineType.EXPRESS,
    });

    this.machine = machine;
  }
}
