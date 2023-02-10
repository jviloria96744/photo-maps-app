import * as events from "aws-cdk-lib/aws-events";
import * as logs from "aws-cdk-lib/aws-logs";
import { Stack, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CloudWatchLogGroup } from "aws-cdk-lib/aws-events-targets";

export class EventBridgeBus extends Construct {
  eventBus: events.EventBus;
  constructor(parent: Stack, name: string) {
    super(parent, name);

    const eventBus = new events.EventBus(this, "AppEventBus", {
      eventBusName: "AppEventBus",
    });

    const logGroup = new logs.LogGroup(this, "EventBusLogGroup", {
      retention: logs.RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const logGroupRule = new events.Rule(this, "EventBusLogRule", {
      eventBus,
      targets: [new CloudWatchLogGroup(logGroup)],
    });

    this.eventBus = eventBus;
  }
}
