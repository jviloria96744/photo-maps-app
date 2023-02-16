import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IConfig } from "../../../config";
import { ImageProcessorLambdasStack } from "./image-processor-lambdas-stack";
import { ImageProcessorStepFunctionStack } from "./image-processor-step-function-stack";
import { lookupResource } from "../../../utils/utils";

interface ImageProcessorStackProps extends cdk.StackProps {
  assetBucketParameterStoreName: string;
  dynamoTableParameterStoreName: string;
  uploadQueueParameterStoreName: string;
  Config: IConfig;
}

export class ImageProcessorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImageProcessorStackProps) {
    super(scope, id, props);

    const {
      Config,
      assetBucketParameterStoreName,
      dynamoTableParameterStoreName,
      uploadQueueParameterStoreName,
    } = props;

    const assetBucket = lookupResource(
      this,
      "AssetBucket",
      assetBucketParameterStoreName,
      s3.Bucket.fromBucketArn
    );
    const dynamoTable = lookupResource(
      this,
      "DynamoTable",
      dynamoTableParameterStoreName,
      dynamodb.Table.fromTableArn
    );
    const uploadQueue = lookupResource(
      this,
      "UploadQueue",
      uploadQueueParameterStoreName,
      sqs.Queue.fromQueueArn
    );

    const imageProcessorLambdas = new ImageProcessorLambdasStack(
      this,
      "Lambdas",
      {
        assetBucket,
        Config,
      }
    );

    const imageProcessingStepFunction = new ImageProcessorStepFunctionStack(
      this,
      "Workflow",
      {
        imageGeotaggerLambda: imageProcessorLambdas.imageGeotaggerLambda,
        imageLabelFilterLambda: imageProcessorLambdas.imageLabelFilterLambda,
        appsyncMessengerLambda: imageProcessorLambdas.appsyncMessengerLambda,
        dynamoTable,
        uploadQueue,
        Config,
      }
    );
  }
}
