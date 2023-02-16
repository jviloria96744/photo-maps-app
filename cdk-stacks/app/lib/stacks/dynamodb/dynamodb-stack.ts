import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

interface DynamoDbStackProps extends cdk.StackProps {
  tableParameterStoreName: string;
}

export class DynamoDbStack extends cdk.Stack {
  table: dynamodb.Table;
  constructor(scope: Construct, id: string, props: DynamoDbStackProps) {
    super(scope, id, props);

    const { tableParameterStoreName } = props;

    const table = new dynamodb.Table(this, "Table", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
    });

    new ssm.StringParameter(this, `TableParameter`, {
      parameterName: tableParameterStoreName,
      stringValue: table.tableArn,
    });

    this.table = table;
  }
}
