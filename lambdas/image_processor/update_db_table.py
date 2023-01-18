import os
import json
from aws_lambda_powertools import Logger

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))

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
        logger.debug(str(e), extra=item)
        raise Exception("Error when writing to dynamodb table")

    return response