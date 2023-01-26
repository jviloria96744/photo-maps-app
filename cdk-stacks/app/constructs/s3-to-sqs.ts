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
  deleteQueue: sqs.Queue;

  constructor(parent: Stack, name: string) {
    super(parent, name);

    const deadLetterQueue = new sqs.Queue(
      parent,
      `${name}-asset-event-dead-letter-queue`,
      {
        retentionPeriod: Duration.days(14),
      }
    );

    const queue = new sqs.Queue(parent, `${name}-asset-event-queue`, {
      visibilityTimeout: Duration.seconds(15),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1,
      },
    });

    const deleteQueue = new sqs.Queue(parent, `${name}-asset-delete-queue`, {
      visibilityTimeout: Duration.seconds(15),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1,
      },
    });

    const bucket = new s3.Bucket(parent, `${name}-asset-bucket`, {
      removalPolicy: RemovalPolicy.RETAIN,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.POST],
          allowedOrigins: ["*"],
        },
      ],
    });

    const queueNotification = new aws_s3_notifications.SqsDestination(queue);
    const deleteQueueNotification = new aws_s3_notifications.SqsDestination(
      deleteQueue
    );

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, queueNotification);
    bucket.addEventNotification(
      s3.EventType.OBJECT_REMOVED,
      deleteQueueNotification
    );

    this.bucket = bucket;
    this.queue = queue;
    this.deleteQueue = deleteQueue;
  }
}
