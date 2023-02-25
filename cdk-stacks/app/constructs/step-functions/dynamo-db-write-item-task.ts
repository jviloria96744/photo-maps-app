import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { JsonPath } from "aws-cdk-lib/aws-stepfunctions";

interface DynamoDbPutItemTaskProps {
  dynamoTable: dynamodb.ITable;
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
            JsonPath.format("USER_{}", JsonPath.stringAt("$.user_id"))
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
          ":geo_point": tasks.DynamoAttributeValue.mapFromJsonPath(
            "$.result[0].result.geoData.geoPoint"
          ),
          ":location_data": tasks.DynamoAttributeValue.mapFromJsonPath(
            "$.result[0].result.geoData.locationData"
          ),
          ":image_properties": tasks.DynamoAttributeValue.mapFromJsonPath(
            "$.result[0].result.geoData.imageProperties"
          ),
          ":image_labels": tasks.DynamoAttributeValue.listFromJsonPath(
            JsonPath.stringAt("$.result[1].result.labels")
          ),
          ":object_key": tasks.DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.object_key")
          ),
        },
        updateExpression: `
          SET 
            datetime_created=:datetime_created,
            datetime_updated=:datetime_updated,
            geo_point=:geo_point,
            location_data=:location_data,
            image_properties=:image_properties,
            image_labels=:image_labels,
            object_key=:object_key
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
    const geoPointKeys = ["object_key", "lat", "lng"];
    const locationDataKeys = ["city", "country", "country_code"];
    const imagePropertiesKeys = [
      "date",
      "image_width",
      "image_height",
      "owner",
    ];

    return {
      ...this.keysFromStringList(itemKeys, "$.Attributes"),
      "image_labels.$": "$.Attributes.image_labels.L",
      geo_point: {
        ...this.keysFromStringList(geoPointKeys, "$.Attributes.geo_point.M"),
      },
      location_data: {
        ...this.keysFromStringList(
          locationDataKeys,
          "$.Attributes.location_data.M"
        ),
      },
      image_properties: {
        ...this.keysFromStringList(
          imagePropertiesKeys,
          "$.Attributes.image_properties.M"
        ),
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
