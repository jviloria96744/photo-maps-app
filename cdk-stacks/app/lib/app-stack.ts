import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { DynamoDBTable } from "../constructs/dynamo-db-table";
import { WebClientStack } from "./stacks/web-client/web-client-stack";
import { ImageProcessorWorkflowStack } from "./stacks/image-processor-workflow-stack";
import { AppApiStack } from "./stacks/app-api-stack";
import { WebSocketStack } from "./stacks/websocket-stack";
import * as path from "path";
import {
  CONFIG,
  DOMAIN_NAMES,
  BUILD_DIRECTORIES,
  OAUTH_GOOGLE_KEYS,
} from "../config";

interface AppStackProps extends cdk.StackProps {
  certificates: {
    adminPortalCertificate: acm.Certificate;
    webClientCertificate: acm.Certificate;
    restApiCertificate: acm.Certificate;
    assetCDNCertificate: acm.Certificate;
    appSyncCertificate: acm.Certificate;
    hostedZone: route53.IHostedZone;
  };
}

export class AppStack extends cdk.Stack {
  dynamoDb: DynamoDBTable;
  webClientStack: WebClientStack;
  imageProcessorWorkflowStack: ImageProcessorWorkflowStack;
  appApiStack: AppApiStack;
  websocketStack: WebSocketStack;
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const { certificates } = props;

    const dynamoDB = new DynamoDBTable(this, "DynamoDB");

    const webClientStack = new WebClientStack(this, "WebClient", {
      siteDomain: `${DOMAIN_NAMES.WEBCLIENT_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
      pathName: path.resolve(
        CONFIG.environment.basePath,
        BUILD_DIRECTORIES.WEB_CLIENT,
        BUILD_DIRECTORIES.STATIC_SITE_BUILD
      ),
      certificate: certificates.webClientCertificate,
      hostedZone: certificates.hostedZone,
      authCallbackUrls: CONFIG.webClient.callbackUrls,
      clientIdKey: OAUTH_GOOGLE_KEYS.CLIENT_ID_KEY,
      clientSecretKey: OAUTH_GOOGLE_KEYS.CLIENT_SECRET_KEY,
    });

    const imageProcessorWorkflowStack = new ImageProcessorWorkflowStack(
      this,
      "ImageProcessor",
      {
        dynamoTable: dynamoDB.table,
        Config: CONFIG,
        assetCDNCertificate: certificates.assetCDNCertificate,
        cdnDomain: `${DOMAIN_NAMES.ASSETS_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
        hostedZone: certificates.hostedZone,
      }
    );

    const appApiStack = new AppApiStack(this, "Server", {
      dynamoTable: dynamoDB.table,
      assetBucket: imageProcessorWorkflowStack.assetBucket.bucket,
      cognitoUserPool: webClientStack.webClientAuthFlow.userPool,
      Config: CONFIG,
      apiDomain: `${DOMAIN_NAMES.API_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
      certificate: certificates.restApiCertificate,
      hostedZone: certificates.hostedZone,
    });

    const websocketStack = new WebSocketStack(this, "websocket", {
      pathName: `${CONFIG.environment.basePath}/${CONFIG.websocket.pathName}`,
      cognitoUserPool: webClientStack.webClientAuthFlow.userPool,
      subDomainName: DOMAIN_NAMES.APPSYNC_SUBDOMAIN,
      domainName: `${DOMAIN_NAMES.APPSYNC_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
      certificate: certificates.appSyncCertificate,
      hostedZone: certificates.hostedZone,
    });

    this.dynamoDb = dynamoDB;
    this.webClientStack = webClientStack;
    this.imageProcessorWorkflowStack = imageProcessorWorkflowStack;
    this.appApiStack = appApiStack;
    this.websocketStack = websocketStack;
  }
}
