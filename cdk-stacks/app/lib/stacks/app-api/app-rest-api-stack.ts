import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { LambdaApi, LambdaApiProps } from "../../../constructs/lambda-rest-api";
import { IConfig } from "../../../config";

interface AppRestApiStackProps extends cdk.NestedStackProps {
  dynamoTable: dynamodb.ITable;
  assetBucket: s3.IBucket;
  cognitoUserPool: cognito.IUserPool;
  Config: IConfig;
  certificate: acm.ICertificate;
  hostedZone: route53.IHostedZone;
  apiDomain: string;
}
export class AppRestApiStack extends cdk.NestedStack {
  lambdaApi: LambdaApi;
  constructor(scope: Construct, id: string, props: AppRestApiStackProps) {
    super(scope, id, props);

    const {
      dynamoTable,
      assetBucket,
      cognitoUserPool,
      Config,
      apiDomain,
      certificate,
      hostedZone,
    } = props;

    const lambdaApiProps: LambdaApiProps = {
      Config,
      apiDomain,
      dynamoTable,
      assetBucket,
      cognitoUserPool,
      certificate,
      hostedZone,
    };
    const lambdaApi = new LambdaApi(this, "LambdaAPI", lambdaApiProps);

    this.lambdaApi = lambdaApi;
  }
}
