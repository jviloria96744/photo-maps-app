import * as events from "aws-cdk-lib/aws-events";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

export class EventBridgeBus extends Construct {
  eventBus: events.EventBus;
  constructor(parent: Stack, name: string) {
    super(parent, name);

    const eventBus = new events.EventBus(this, "AppEventBus", {
      eventBusName: "AppEventBus",
    });

    this.eventBus = eventBus;
  }
}
