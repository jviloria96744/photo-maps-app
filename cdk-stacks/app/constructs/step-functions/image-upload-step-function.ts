import * as step_function from "aws-cdk-lib/aws-stepfunctions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonLambda } from "../python-lambda";
import { DynamoDbWriteItemTask } from "./dynamo-db-write-item-task";
import { ParallelImageProcessingTask } from "./parallel-image-processing-task";
import { ManifestFileTasks } from "./manifest-file-tasks";
import { EventBridgePutItemTask } from "./eventbridge-put-item-task";

interface ImageUploadStepFunctionProps {
  imageLabelFilterLambda: PythonLambda;
  imageGeotaggerLambda: PythonLambda;
  dynamoTable: dynamodb.Table;
  eventBus: events.EventBus;
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
      eventBus,
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

    const publishMessageTask = new EventBridgePutItemTask(
      parent,
      "SendMessageTask",
      {
        eventBus,
      }
    );

    const definition = manifestTasks.uploadTask
      .next(mapImages)
      .next(publishMessageTask.task)
      // Appsync Notification will go here
      .next(manifestTasks.deleteTask);

    const machine = new step_function.StateMachine(this, "StateMachine", {
      definition,
      // stateMachineType: step_function.StateMachineType.EXPRESS,
    });

    this.machine = machine;
  }
}
