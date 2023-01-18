import os
import json

def update_table_with_item(item: dict, ddb_client):
    try:
        TABLE_NAME = os.getenv("DDB_TABLE_NAME")
        if not TABLE_NAME:
            raise Exception("Table Name is Missing")
        response = ddb_client.put_item(
            TableName=TABLE_NAME,
            Item={
                "pk": {
                    'S': item["pk"]
                },
                "sk": {
                    'S': item["sk"]
                },
                "metadata": {
                    'S': json.dumps(item["metadata"])
                }
            },
            ReturnValues="NONE",
            ReturnConsumedCapacity="NONE")
    except Exception as e:
        print(str(e))
        raise Exception("Error when writing to dynamodb table")

    return response