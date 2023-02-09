import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

export class ManifestFileTasks extends Construct {
  uploadTask: tasks.CallAwsService;
  deleteTask: tasks.CallAwsService;
  constructor(parent: Stack, name: string) {
    super(parent, name);
    const uploadTask = new tasks.CallAwsService(
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

    const deleteTask = new tasks.CallAwsService(
      this,
      "Delete Photo Upload Manifest",
      {
        service: "s3",
        action: "deleteObject",
        parameters: {
          "Bucket.$": "$.bucket_name",
          "Key.$": "$.object_key",
        },
        iamResources: ["*"],
        // resultSelector: {
        //   "manifestData.$": "States.StringToJson($.Body)",
        // },
        resultPath: "$.result",
        comment:
          "Once all processing is complete, we can remove the manifest file",
      }
    );

    this.uploadTask = uploadTask;
    this.deleteTask = deleteTask;
  }
}
