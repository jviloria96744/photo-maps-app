import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { JsonPath } from "aws-cdk-lib/aws-stepfunctions";

interface DynamoDbPutItemTaskProps {
  dynamoTable: dynamodb.Table;
}

export class DynamoDbWriteItemTask extends Construct {
  task: tasks.DynamoUpdateItem;
  constructor(parent: Stack, name: string, props: DynamoDbPutItemTaskProps) {
    super(parent, name);

    const { dynamoTable } = props;

    const dynamoDbUpdateItemTask = new tasks.DynamoUpdateItem(
      this,
      "Write Image Metadata To DynamoDB",
      {
        table: dynamoTable,
        returnValues: tasks.DynamoReturnValues.ALL_NEW,
        key: {
          pk: tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.userId")
          ),
          sk: tasks.DynamoAttributeValue.fromString(
            JsonPath.format(
              "IMAGE_{}",
              JsonPath.stringAt("$.result[0].result.geoData.image_id")
            )
          ),
        },
        expressionAttributeValues: {
          ":datetime_created": tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$$.State.EnteredTime")
          ),
          ":datetime_updated": tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$$.State.EnteredTime")
          ),
          ":geo_data": tasks.DynamoAttributeValue.mapFromJsonPath(
            "$.result[0].result.geoData"
          ),
          ":object_key": tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.imageId")
          ),
          ":image_labels": tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.result[1].result.labels")
          ),
        },
        updateExpression: `
          SET 
            datetime_created=:datetime_created,
            datetime_updated=:datetime_updated,
            geo_data=:geo_data,
            object_key=:object_key,
            image_labels=:image_labels
        `,
        resultPath: "$.result",
      }
    );
    // const dynamoDbPutItemTask = new tasks.DynamoPutItem(
    //   this,
    //   "Write Image Metadata To DynamoDB",
    //   {
    //     item: {
    //       pk: tasks.DynamoAttributeValue.fromString(
    //         JsonPath.stringAt("$.userId")
    //       ),
    //       sk: tasks.DynamoAttributeValue.fromString(
    //         JsonPath.format(
    //           "IMAGE_{}",
    //           JsonPath.stringAt("$.result[0].result.geoData.image_id")
    //         )
    //       ),
    //       datetime_created: tasks.DynamoAttributeValue.fromString(
    //         JsonPath.stringAt("$$.State.EnteredTime")
    //       ),
    //       datetime_updated: tasks.DynamoAttributeValue.fromString(
    //         JsonPath.stringAt("$$.State.EnteredTime")
    //       ),
    //       geo_data: tasks.DynamoAttributeValue.mapFromJsonPath(
    //         "$.result[0].result.geoData"
    //       ),
    //       object_key: tasks.DynamoAttributeValue.fromString(
    //         JsonPath.stringAt("$.imageId")
    //       ),
    //       image_labels: tasks.DynamoAttributeValue.fromString(
    //         JsonPath.stringAt("$.result[1].result.labels")
    //       ),
    //     },
    //     table: dynamoTable,
    //     // resultSelector: {
    //     //   "statusCode.$": "$.SdkHttpMetadata.HttpStatusCode",
    //     // },
    //     resultPath: "$.result",
    //     returnValues: tasks.DynamoReturnValues.ALL_NEW,
    //   }
    // );

    this.task = dynamoDbUpdateItemTask;
  }
}
