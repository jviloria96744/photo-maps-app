import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { lookupResource, createPathName } from "../../../utils/utils";
import { IConfig } from "../../../config";

interface AssetBucketStackProps extends cdk.StackProps {
  tldDomainName: string;
  fullDomainName: string;
  certificateParameterStoreName: string;
  deadLetterQueueParameterStoreName: string;
  assetBucketParameterStoreName: string;
  deleteQueueParameterStoreName: string;
  uploadQueueParameterStoreName: string;
  Config: IConfig;
}

export class AssetBucketStack extends cdk.Stack {
  bucket: s3.Bucket;
  deleteQueue: sqs.Queue;
  uploadQueue: sqs.Queue;
  constructor(scope: Construct, id: string, props: AssetBucketStackProps) {
    super(scope, id, props);

    const {
      tldDomainName,
      fullDomainName,
      certificateParameterStoreName,
      deadLetterQueueParameterStoreName,
      assetBucketParameterStoreName,
      deleteQueueParameterStoreName,
      uploadQueueParameterStoreName,
      Config,
    } = props;

    const deadLetterQueue = lookupResource(
      this,
      "AssetBucketDLQ",
      deadLetterQueueParameterStoreName,
      sqs.Queue.fromQueueArn
    );

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
      certificateParameterStoreName,
      Config
    );

    const uploadQueue = this.createUploadQueueTrigger(deadLetterQueue, bucket);
    const deleteQueue = this.createDeleteQueueTrigger(deadLetterQueue, bucket);

    new ssm.StringParameter(this, `BucketParameter`, {
      parameterName: assetBucketParameterStoreName,
      stringValue: bucket.bucketArn,
    });

    new ssm.StringParameter(this, `DeleteQueueParameter`, {
      parameterName: deleteQueueParameterStoreName,
      stringValue: deleteQueue.queueArn,
    });

    new ssm.StringParameter(this, `UploadQueueParameter`, {
      parameterName: uploadQueueParameterStoreName,
      stringValue: uploadQueue.queueArn,
    });

    this.bucket = bucket;
    this.deleteQueue = deleteQueue;
    this.uploadQueue = uploadQueue;
  }

  private createCloudfrontDistributionResources(
    tldDomainName: string,
    bucket: s3.Bucket,
    fullDomainName: string,
    certificateParameterStoreName: string,
    Config: IConfig
  ): void {
    const certificate = lookupResource(
      this,
      "AssetCdnCertificate",
      certificateParameterStoreName,
      acm.Certificate.fromCertificateArn
    );

    const hostedZone = route53.HostedZone.fromLookup(this, `HostedZone`, {
      domainName: tldDomainName,
    });

    const cfEdgeFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "CFEdgeFunction",
      {
        runtime: lambda.Runtime.PYTHON_3_7,
        handler: "app.handler",
        logRetention: logs.RetentionDays.ONE_MONTH,
        code: lambda.Code.fromAsset(
          createPathName(
            Config.environment.basePath,
            Config.pythonLambdas.imageRequestEdgeFunction.codeDirectory
          ),
          {
            bundling: {
              image: lambda.Runtime.PYTHON_3_7.bundlingImage,
              command: Config.pythonLambdas.buildCommands,
            },
          }
        ),
      }
    );

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(bucket),
        edgeLambdas: [
          {
            functionVersion: cfEdgeFunction.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
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

  private createUploadQueueTrigger(
    deadLetterQueue: sqs.IQueue,
    bucket: s3.Bucket
  ): sqs.Queue {
    const uploadQueue = new sqs.Queue(this, "EventQueue", {
      visibilityTimeout: cdk.Duration.seconds(15),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 1,
      },
    });

    const uploadQueueNotification = new cdk.aws_s3_notifications.SqsDestination(
      uploadQueue
    );

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      uploadQueueNotification,
      {
        prefix: "image_manifest/",
        suffix: ".json",
      }
    );

    return uploadQueue;
  }

  private createDeleteQueueTrigger(
    deadLetterQueue: sqs.IQueue,
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
