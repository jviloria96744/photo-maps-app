import * as step_function from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

export class ImageUploadStepFunction extends Construct {
  machine: step_function.StateMachine;
  constructor(parent: Stack, name: string) {
    super(parent, name);

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

    parallelImageProcessingTask.branch(
      new step_function.Pass(this, "Debug Step GeoTagging")
    );

    parallelImageProcessingTask.branch(
      new step_function.Pass(this, "Debug Step Rekognition")
    );

    mapImages.iterator(parallelImageProcessingTask);

    const definition = getUploadManifest.next(mapImages);

    const machine = new step_function.StateMachine(this, "StateMachine", {
      definition,
      // stateMachineType: step_function.StateMachineType.EXPRESS,
    });

    this.machine = machine;
  }
}
