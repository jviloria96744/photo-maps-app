import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { LambdaApi, LambdaApiProps } from "../../constructs/lambda-rest-api";
import { domainName, subDomain } from "../../config";

interface AppApiStackProps extends cdk.StackProps {
  dynamoTable: dynamodb.Table;
  assetBucket: s3.Bucket;
  cognitoUserPool: cognito.UserPool;
}
export class AppApiStack extends cdk.NestedStack {
  lambdaApi: LambdaApi;
  constructor(scope: Construct, id: string, props: AppApiStackProps) {
    super(scope, id, props);

    const { dynamoTable, assetBucket, cognitoUserPool } = props;
    const basePath = process.env.GITHUB_WORKSPACE || "";

    const lambdaApiProps: LambdaApiProps = {
      codeDirectory: "app_server",
      basePath,
      dynamoTable,
      assetBucket,
      domainName,
      subDomain,
      cognitoUserPool,
    };
    const lambdaApi = new LambdaApi(this, `${id}-lambdaapi`, lambdaApiProps);

    this.lambdaApi = lambdaApi;
  }
}
