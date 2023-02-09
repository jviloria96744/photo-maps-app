import * as step_function from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { PythonLambda } from "../python-lambda";
import { JsonPath } from "aws-cdk-lib/aws-stepfunctions";

interface ImageUploadStepFunctionProps {
  imageLabelFilterLambda: PythonLambda;
  imageGeotaggerLambda: PythonLambda;
  dynamoTable: dynamodb.Table;
}

export class ImageUploadStepFunction extends Construct {
  machine: step_function.StateMachine;
  constructor(
    parent: Stack,
    name: string,
    props: ImageUploadStepFunctionProps
  ) {
    super(parent, name);

    const { imageLabelFilterLambda, imageGeotaggerLambda, dynamoTable } = props;

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
        "userId.$": "$.result.manifestData.userId",
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
        resultPath: "$.result",
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

    const dynamoDbPutItemTask = new tasks.DynamoPutItem(
      this,
      "Write Image Metadata To DynamoDB",
      {
        item: {
          pk: tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.userId")
          ),
          sk: tasks.DynamoAttributeValue.fromString(
            JsonPath.format(
              "IMAGE_{}",
              JsonPath.stringAt("$.result[0].result.geoData.image_id")
            )
          ),
          datetime_created: tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$$.State.EnteredTime")
          ),
          datetime_updated: tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$$.State.EnteredTime")
          ),
          geo_data: tasks.DynamoAttributeValue.mapFromJsonPath(
            "$.result[0].result.geoData"
          ),
          object_key: tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.imageId")
          ),
          image_labels: tasks.DynamoAttributeValue.fromList(
            JsonPath.listAt("$.result[1].result.labels").map((item) =>
              tasks.DynamoAttributeValue.mapFromJsonPath(item)
            )
          ),
          // image_labels: tasks.DynamoAttributeValue.fromString(
          //   JsonPath.stringAt("$.result[1].result.labels")
          // ),
        },
        table: dynamoTable,
        resultPath: "$.result",
      }
    );

    parallelImageProcessingTask.next(dynamoDbPutItemTask);

    mapImages.iterator(parallelImageProcessingTask);

    const definition = getUploadManifest.next(mapImages);

    const machine = new step_function.StateMachine(this, "StateMachine", {
      definition,
      // stateMachineType: step_function.StateMachineType.EXPRESS,
    });

    this.machine = machine;
  }
}
