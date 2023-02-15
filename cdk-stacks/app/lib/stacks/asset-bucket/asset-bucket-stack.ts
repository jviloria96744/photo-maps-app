import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { lookupCertificate } from "../../../utils/utils";

interface AssetBucketStackProps extends cdk.StackProps {
  tldDomainName: string;
  fullDomainName: string;
  certificateParameterStoreName: string;
  deadLetterQueue: sqs.Queue;
}

export class AssetBucketStack extends cdk.Stack {
  bucket: s3.Bucket;
  deleteQueue: sqs.Queue;
  constructor(scope: Construct, id: string, props: AssetBucketStackProps) {
    super(scope, id, props);

    const {
      tldDomainName,
      fullDomainName,
      certificateParameterStoreName,
      deadLetterQueue,
    } = props;

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.POST],
          allowedOrigins: ["*"],
        },
      ],
    });

    this.createCloudfrontDistributionResources(
      tldDomainName,
      bucket,
      fullDomainName,
      certificateParameterStoreName
    );

    const deleteQueue = this.createDeleteQueueTrigger(deadLetterQueue, bucket);

    this.bucket = bucket;
    this.deleteQueue = deleteQueue;
  }

  private createCloudfrontDistributionResources(
    tldDomainName: string,
    bucket: s3.Bucket,
    fullDomainName: string,
    certificateParameterStoreName: string
  ): void {
    const certificate = lookupCertificate(this, certificateParameterStoreName);

    const hostedZone = route53.HostedZone.fromLookup(this, `HostedZone`, {
      domainName: tldDomainName,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(bucket),
      },
      domainNames: [fullDomainName],
      certificate: certificate,
    });

    new route53.ARecord(this, "CDNARecord", {
      recordName: fullDomainName,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });
  }

  private createDeleteQueueTrigger(
    deadLetterQueue: sqs.Queue,
    bucket: s3.Bucket
  ): sqs.Queue {
    const deleteQueue = new sqs.Queue(this, "ImageDeleteQueue", {
      visibilityTimeout: cdk.Duration.seconds(15),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1,
      },
    });

    const deleteQueueNotification = new cdk.aws_s3_notifications.SqsDestination(
      deleteQueue
    );

    bucket.addEventNotification(
      s3.EventType.OBJECT_REMOVED,
      deleteQueueNotification,
      {
        suffix: ".jpg",
      }
    );
    bucket.addEventNotification(
      s3.EventType.OBJECT_REMOVED,
      deleteQueueNotification,
      {
        suffix: ".jpeg",
      }
    );

    return deleteQueue;
  }
}
