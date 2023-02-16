import * as step_function from "aws-cdk-lib/aws-stepfunctions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonLambda } from "../lambda-functions/python-lambda";
import { NodeLambda } from "../lambda-functions/node-lambda";
import { DynamoDbWriteItemTask } from "./dynamo-db-write-item-task";
import { ParallelImageProcessingTask } from "./parallel-image-processing-task";
import { ManifestFileTasks } from "./manifest-file-tasks";
import { AppsyncMutationTask } from "./appsync-mutation-task";

interface ImageUploadStepFunctionProps {
  imageLabelFilterLambda: PythonLambda;
  imageGeotaggerLambda: PythonLambda;
  appsyncMessengerLambda: NodeLambda;
  dynamoTable: dynamodb.ITable;
}

export class ImageUploadStepFunction extends Construct {
  machine: step_function.StateMachine;
  constructor(
    parent: Stack,
    name: string,
    props: ImageUploadStepFunctionProps
  ) {
    super(parent, name);

    const {
      imageLabelFilterLambda,
      imageGeotaggerLambda,
      dynamoTable,
      appsyncMessengerLambda,
    } = props;

    const parallelImageProcessingTask = new ParallelImageProcessingTask(
      parent,
      "ParallelTask",
      {
        imageLabelFilterLambda,
        imageGeotaggerLambda,
      }
    );

    const dynamoDbWriteItemTask = new DynamoDbWriteItemTask(
      parent,
      "DynamoPutItemTask",
      {
        dynamoTable,
      }
    );

    parallelImageProcessingTask.task.next(dynamoDbWriteItemTask.task);

    const mapImages = new step_function.Map(this, "Process Images", {
      parameters: {
        "Bucket.$": "$.bucket_name",
        "imageId.$": "$$.Map.Item.Value",
        "userId.$": "$.result.manifestData.userId",
      },
      itemsPath: "$.result.manifestData.imageIds",
      resultPath: "$.result",
      maxConcurrency: 0,
    });
    mapImages.iterator(parallelImageProcessingTask.task);

    const manifestTasks = new ManifestFileTasks(parent, "ManifestFileTasks");

    const appsyncMutationTask = new AppsyncMutationTask(
      parent,
      "SendMessageTask",
      {
        lambda: appsyncMessengerLambda,
      }
    );

    const definition = manifestTasks.uploadTask
      .next(mapImages)
      .next(appsyncMutationTask.task)
      .next(manifestTasks.deleteTask);

    const machine = new step_function.StateMachine(this, "StateMachine", {
      definition,
      // stateMachineType: step_function.StateMachineType.EXPRESS,
    });

    this.machine = machine;
  }
}
