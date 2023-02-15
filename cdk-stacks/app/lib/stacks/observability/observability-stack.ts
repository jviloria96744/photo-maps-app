import * as cdk from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class ObservabilityStack extends cdk.Stack {
  deadLetterQueue: sqs.Queue;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deadLetterQueue = new sqs.Queue(this, "DeadLetterQueue", {
      retentionPeriod: cdk.Duration.days(14),
    });

    this.deadLetterQueue = deadLetterQueue;
  }
}
