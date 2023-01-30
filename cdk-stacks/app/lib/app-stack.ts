import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CertificateStack } from "./stacks/certificate-stack";
// import { DynamoDBTable } from "../constructs/dynamo-db-table";
// import { AdminSiteStack } from "./stacks/admin-site-stack";
// import { WebClientStack } from "./stacks/web-client-stack";
// import { ImageProcessorWorkflowStack } from "./stacks/image-processor-workflow-stack";
// import { AppApiStack } from "./stacks/app-api-stack";
// import { WebSocketStack } from "./stacks/websocket-stack";
import { CONFIG } from "../config";

export class AppStack extends cdk.Stack {
  certificateStack: CertificateStack;
  // adminSiteStack: AdminSiteStack;
  // webClientStack: WebClientStack;
  // imageProcessorWorkflowStack: ImageProcessorWorkflowStack;
  // appApiStack: AppApiStack;
  // websocketStack: WebSocketStack;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      domainName,
      adminPortalSubDomain,
      webClientSubDomain,
      apiSubDomain,
    } = CONFIG;
    const certificateStack = new CertificateStack(this, "CertStack", {
      env: {
        region: "us-east-1", // Certificates are only valid in us-east-1 region
      },
      crossRegionReferences: true,
      domainName,
      adminPortalSubDomain,
      webClientSubDomain,
      apiSubDomain,
    });

    // const dynamoDB = new DynamoDBTable(this, "db-table");

    // const adminSiteStack = new AdminSiteStack(this, "admin-site");

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

    this.certificateStack = certificateStack;
    // this.adminSiteStack = adminSiteStack;
    // this.webClientStack = webClientStack;
    // this.imageProcessorWorkflowStack = imageProcessorWorkflowStack;
    // this.appApiStack = appApiStack;
    // this.websocketStack = websocketStack;
  }
}
