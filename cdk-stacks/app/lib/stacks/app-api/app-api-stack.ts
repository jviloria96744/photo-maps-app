import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { AppRestApiStack } from "./app-rest-api-stack";
import { WebSocketStack } from "./websocket-stack";
import { IConfig } from "../../../config";
import { lookupResource } from "../../../utils/utils";

interface AppApiStackProps extends cdk.StackProps {
  dynamoTableParameterStoreName: string;
  assetBucketParameterStoreName: string;
  cognitoUserPoolParameterStoreName: string;
  restApiCertificateParameterStoreName: string;
  Config: IConfig;
  domainName: string;
  apiGatewayDomain: string;
  appSyncCertificateParameterStoreName: string;
  appSyncDomain: string;
  appSyncSchemaPathName: string;
}

export class AppApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppApiStackProps) {
    super(scope, id, props);
    const {
      dynamoTableParameterStoreName,
      assetBucketParameterStoreName,
      cognitoUserPoolParameterStoreName,
      restApiCertificateParameterStoreName,
      Config,
      domainName,
      apiGatewayDomain,
      appSyncCertificateParameterStoreName,
      appSyncDomain,
      appSyncSchemaPathName,
    } = props;

    const zone = route53.HostedZone.fromLookup(this, `HostedZone`, {
      domainName: domainName,
    });

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

    const webClientUserPool = lookupResource(
      this,
      "WebClientUserPool",
      cognitoUserPoolParameterStoreName,
      cognito.UserPool.fromUserPoolArn
    );

    const restApiCertificate = lookupResource(
      this,
      "RestApiCertificate",
      restApiCertificateParameterStoreName,
      acm.Certificate.fromCertificateArn
    );

    const restApiStack = new AppRestApiStack(this, "RestApi", {
      dynamoTable,
      assetBucket,
      cognitoUserPool: webClientUserPool,
      Config,
      certificate: restApiCertificate,
      hostedZone: zone,
      apiDomain: apiGatewayDomain,
    });

    const appSyncCertificate = lookupResource(
      this,
      "AppSyncCertificate",
      appSyncCertificateParameterStoreName,
      acm.Certificate.fromCertificateArn
    );

    const webSocketStack = new WebSocketStack(this, "WebSocket", {
      pathName: appSyncSchemaPathName,
      cognitoUserPool: webClientUserPool,
      subDomainName: appSyncDomain,
      domainName: `${appSyncDomain}.${domainName}`,
      certificate: appSyncCertificate,
      hostedZone: zone,
    });
  }
}
