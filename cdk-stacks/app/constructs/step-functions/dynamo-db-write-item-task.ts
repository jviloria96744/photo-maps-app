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
        resultSelector: {
          "statusCode.$": "$.SdkHttpMetadata.HttpStatusCode",
          item: this.createItemOutput(),
        },
        resultPath: "$.result",
      }
    );

    this.task = dynamoDbUpdateItemTask;
  }

  private createItemOutput(): { [key: string]: any } {
    const itemKeys = [
      "pk",
      "sk",
      "datetime_created",
      "datetime_updated",
      "object_key",
    ];
    const geoDataKeys = [
      "date",
      "country",
      "country_code",
      "image_length",
      "image_width",
      "lng",
      "lat",
      "city",
      "image_id",
    ];
    return {
      ...this.keysFromStringList(itemKeys, "$.Attributes"),
      "image_labels.$": "States.StringToJson($.Attributes.image_labels.S)",
      geo_data: {
        ...this.keysFromStringList(geoDataKeys, "$.Attributes.geo_data.M"),
      },
    };
  }

  private keysFromStringList(keys: string[], basePath: string) {
    const obj: { [key: string]: string } = {};
    keys.forEach((key) => {
      obj[`${key}.$`] = `${basePath}.${key}.S`;
    });

    return obj;
  }
}
