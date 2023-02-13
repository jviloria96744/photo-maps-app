import * as step_functions from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Stack, Duration } from "aws-cdk-lib";
import { NodeLambda } from "../node-lambda";
import { Construct } from "constructs";
import { JsonFileLogDriver } from "aws-cdk-lib/aws-ecs";

interface AppsyncMutationTaskProps {
  lambda: NodeLambda;
}

export class AppsyncMutationTask extends Construct {
  task: tasks.LambdaInvoke;
  constructor(parent: Stack, name: string, props: AppsyncMutationTaskProps) {
    super(parent, name);

    const { lambda } = props;

    const task = new tasks.LambdaInvoke(this, "Send Message To Appsync", {
      lambdaFunction: lambda.function,
      retryOnServiceExceptions: false,
      resultPath: step_functions.JsonPath.DISCARD,
    });

    this.task = task;
  }
}
