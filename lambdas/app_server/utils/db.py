import os
import json
import boto3
from utils.logger import logger

ddb_client = boto3.client("dynamo_db")
TABLE_NAME = os.getenv("DDB_TABLE_NAME")

def delete_item_from_dynamodb(partition_key, sort_key):
    response = ddb_client.delete_item(
        TableName=TABLE_NAME,
        Key={
            "pk": {
                'S': partition_key
            },
            "sk": {
                'S': sort_key 
            }
        })

    logger.info("Deleted image data from DynamoDB", extra=response)
    
    return response


def update_table_with_item(item: dict):
    try:
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