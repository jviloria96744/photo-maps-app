import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { DynamoDBTable } from "../constructs/dynamo-db-table";
import { AdminSiteStack } from "./stacks/admin-site-stack";
// import { WebClientStack } from "./stacks/web-client-stack";
// import { ImageProcessorWorkflowStack } from "./stacks/image-processor-workflow-stack";
// import { AppApiStack } from "./stacks/app-api-stack";
// import { WebSocketStack } from "./stacks/websocket-stack";
import * as path from "path";
import { CONFIG, DOMAIN_NAMES, BUILD_DIRECTORIES } from "../config";

interface AppStackProps extends cdk.StackProps {
  certificates: {
    adminPortalCertificate: acm.Certificate;
    webClientCertificate: acm.Certificate;
    restApiCertificate: acm.Certificate;
    hostedZone: route53.IHostedZone;
  };
}

export class AppStack extends cdk.Stack {
  dynamoDb: DynamoDBTable;
  adminSiteStack: AdminSiteStack;
  // webClientStack: WebClientStack;
  // imageProcessorWorkflowStack: ImageProcessorWorkflowStack;
  // appApiStack: AppApiStack;
  // websocketStack: WebSocketStack;
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const { certificates } = props;

    const dynamoDB = new DynamoDBTable(this, "DynamoDB");

    const adminSiteStack = new AdminSiteStack(this, "AdminPortal", {
      siteDomain: `${DOMAIN_NAMES.ADMIN_PORTAL_SUBDOMAIN}.${DOMAIN_NAMES.TLD_NAME}`,
      pathName: path.resolve(
        CONFIG.environment.basePath,
        BUILD_DIRECTORIES.ADMIN_PORTAL,
        BUILD_DIRECTORIES.STATIC_SITE_BUILD
      ),
      certificate: certificates.adminPortalCertificate,
      hostedZone: certificates.hostedZone,
      authCallbackUrls: CONFIG.adminPortal.callbackUrls,
    });

    // const webClientStack = new WebClientStack(this, "web-client");

    // const imageProcessorWorkflowStack = new ImageProcessorWorkflowStack(
    //   this,
    //   "image-processor",
    //   {
    //     dynamoTable: dynamoDB.table,
    //   }
    // );

    // const appApiStack = new AppApiStack(this, "app-server", {
    //   dynamoTable: dynamoDB.table,
    //   assetBucket: imageProcessorWorkflowStack.assetBucket.bucket,
    //   cognitoUserPool: webClientStack.webClientAuthFlow.userPool,
    // });

    // const websocketStack = new WebSocketStack(this, "websocket");

    this.dynamoDb = dynamoDB;
    this.adminSiteStack = adminSiteStack;
    // this.webClientStack = webClientStack;
    // this.imageProcessorWorkflowStack = imageProcessorWorkflowStack;
    // this.appApiStack = appApiStack;
    // this.websocketStack = websocketStack;
  }
}
