import * as step_functions from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as events from "aws-cdk-lib/aws-events";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

interface EventBridgePutItemTaskProps {
  eventBus: events.EventBus;
}

export class EventBridgePutItemTask extends Construct {
  task: tasks.EventBridgePutEvents;
  constructor(parent: Stack, name: string, props: EventBridgePutItemTaskProps) {
    super(parent, name);

    const { eventBus } = props;
    const eventBridgePutItemTask = new tasks.EventBridgePutEvents(
      this,
      "Send Message To EventBridge",
      {
        entries: [
          {
            detail: step_functions.TaskInput.fromObject({
              channel: step_functions.JsonPath.format(
                "channel-{}",
                step_functions.JsonPath.stringAt("$.userId")
              ),
              data: step_functions.JsonPath.objectAt("$.result"),
            }),
            detailType: "ImagesUploadMessageFromStepFunctions",
            eventBus: eventBus,
            source: "step.functions",
          },
        ],
      }
    );

    this.task = eventBridgePutItemTask;
  }
}
