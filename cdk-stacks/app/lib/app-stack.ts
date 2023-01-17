import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDBTable } from "../constructs/dynamo-db-table";
import { AdminSiteStack } from "./stacks/admin-site-stack";
import { WebClientStack } from "./stacks/web-client-stack";
import { ImageProcessorWorkflowStack } from "./stacks/image-processor-workflow-stack";

export class AppStack extends cdk.Stack {
  adminSiteStack: AdminSiteStack;
  webClientStack: WebClientStack;
  imageProcessorWorkflowStack: ImageProcessorWorkflowStack;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoDB = new DynamoDBTable(this, "db-table");

    const adminSiteStack = new AdminSiteStack(this, "admin-site");

    const webClientStack = new WebClientStack(this, "web-client");

    const imageProcessorWorkflowStack = new ImageProcessorWorkflowStack(
      this,
      "image-processor",
      {
        dynamoTable: dynamoDB.table,
      }
    );

    this.adminSiteStack = adminSiteStack;
    this.webClientStack = webClientStack;
    this.imageProcessorWorkflowStack = imageProcessorWorkflowStack;
  }
}
