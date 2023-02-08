import * as step_function from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

interface ImageUploadStepFunctionProps {
  bucket: s3.Bucket;
}
export class ImageUploadStepFunction extends Construct {
  machine: step_function.StateMachine;
  constructor(
    parent: Stack,
    name: string,
    props: ImageUploadStepFunctionProps
  ) {
    super(parent, name);

    const { bucket } = props;

    const getUploadManifest = new tasks.CallAwsService(this, "GetManifest", {
      service: "s3",
      action: "getObject",
      parameters: {
        Bucket: bucket.bucketName,
        "Key.$": "$.object_key",
      },
      iamResources: ["s3:getObject"],
      resultSelector: {
        "output.$": "States.stringToJson($.Body)",
      },
      comment:
        "Get manifest file from S3 to determine files that need to be processed",
    });

    const definition = getUploadManifest;

    const machine = new step_function.StateMachine(this, "StateMachine", {
      definition,
    });

    this.machine = machine;
  }
}
