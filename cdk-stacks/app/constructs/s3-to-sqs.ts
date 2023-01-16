import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import {
  Stack,
  RemovalPolicy,
  Duration,
  aws_s3_notifications,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class S3ToSQS extends Construct {
  bucket: s3.Bucket;
  queue: sqs.Queue;
  constructor(parent: Stack, name: string) {
    super(parent, name);

    const queue = new sqs.Queue(parent, `${name}-asset-event-queue`, {
      visibilityTimeout: Duration.seconds(15),
    });

    const bucket = new s3.Bucket(parent, `${name}-asset-bucket`, {
      removalPolicy: RemovalPolicy.RETAIN,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const queueNotification = new aws_s3_notifications.SqsDestination(queue);

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, queueNotification);

    this.bucket = bucket;
    this.queue = queue;
  }
}
