import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { lookupCertificate } from "../../../utils/utils";

interface AssetBucketStackProps extends cdk.StackProps {
  domainName: string;
  certificateParameterStoreName: string;
}

export class AssetBucketStack extends cdk.Stack {
  bucket: s3.Bucket;
  constructor(scope: Construct, id: string, props: AssetBucketStackProps) {
    super(scope, id, props);

    const { domainName, certificateParameterStoreName } = props;

    const certificate = lookupCertificate(this, certificateParameterStoreName);

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

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(bucket),
      },
      domainNames: [domainName],
      certificate: certificate,
    });

    const hostedZone = route53.HostedZone.fromLookup(this, `HostedZone`, {
      domainName: domainName,
    });

    new route53.ARecord(this, "CDNARecord", {
      recordName: domainName,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
    });

    this.bucket = bucket;
  }
}
