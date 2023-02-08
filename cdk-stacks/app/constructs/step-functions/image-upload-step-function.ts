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
      itemsPath: "$.result.manifestData.imageIds",
      maxConcurrency: 0,
    });

    mapImages.iterator(
      new step_function.Pass(this, "Debug Step", {
        resultPath: "$.result",
      })
    );

    const definition = getUploadManifest.next(mapImages);

    const machine = new step_function.StateMachine(this, "StateMachine", {
      definition,
      // stateMachineType: step_function.StateMachineType.EXPRESS,
    });

    this.machine = machine;
  }
}
