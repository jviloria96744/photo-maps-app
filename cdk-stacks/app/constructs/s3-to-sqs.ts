import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import {
  Stack,
  RemovalPolicy,
  Duration,
  aws_s3_notifications,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface S3ToSQSProps {
  certificate: acm.Certificate;
  domainName: string;
  hostedZone: route53.IHostedZone;
}

export class S3ToSQS extends Construct {
  bucket: s3.Bucket;
  queue: sqs.Queue;
  deleteQueue: sqs.Queue;
  assetCdnDistribution: cloudfront.Distribution;

  constructor(parent: Stack, name: string, props: S3ToSQSProps) {
    super(parent, name);

    const { certificate, domainName, hostedZone } = props;

    const deadLetterQueue = new sqs.Queue(parent, "DeadLetterQueue", {
      retentionPeriod: Duration.days(14),
    });

    const queue = new sqs.Queue(parent, "EventQueue", {
      visibilityTimeout: Duration.seconds(15),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1,
      },
    });

    const deleteQueue = new sqs.Queue(parent, "DeleteQueue", {
      visibilityTimeout: Duration.seconds(15),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1,
      },
    });

    const bucket = new s3.Bucket(parent, "Bucket", {
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

    const distribution = new cloudfront.Distribution(parent, "Distribution", {
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(bucket),
      },
      domainNames: [domainName],
      certificate: certificate,
    });

    new route53.ARecord(parent, "CDNARecord", {
      recordName: domainName,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });

    const queueNotification = new aws_s3_notifications.SqsDestination(queue);
    // const deleteQueueNotification = new aws_s3_notifications.SqsDestination(
    //   deleteQueue
    // );

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, queueNotification);
    // bucket.addEventNotification(
    //   s3.EventType.OBJECT_REMOVED,
    //   deleteQueueNotification
    // );

    this.bucket = bucket;
    this.queue = queue;
    this.deleteQueue = deleteQueue;
    this.assetCdnDistribution = distribution;
  }
}
