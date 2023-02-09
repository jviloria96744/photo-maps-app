import json
import os
import boto3
from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))

dynamodb_client = boto3.client("dynamodb")

def get_event_metadata(event: dict):
    try:
        event_metadata = json.loads(event["Records"][0]["body"])
        event_metadata = event_metadata["Records"][0]

        s3_object_key = event_metadata["s3"]["object"]["key"]
        split_key = s3_object_key.split("/")
        user_id, photo_id = split_key[0], split_key[2]
        
        if not user_id or not photo_id:
            raise Exception("Key name is not in correct format")

        return {
            "partition_key": f"USER_{user_id}",
            "sort_key": f"IMAGE_{photo_id}"
        }
    except Exception as e:
        logger.debug(str(e), extra=event)
        raise Exception("Error extracting metadata from event object")


@logger.inject_lambda_context(log_event=False)
def handler(event: dict, context: LambdaContext):
    event_metadata = get_event_metadata(event)
    logger.info("Successfully extracted event metadata", extra=event_metadata)

    response = dynamodb_client.delete_item(
        TableName=os.getenv("DDB_TABLE_NAME"),
        Key={
            "pk": {
                'S': event_metadata["partition_key"] 
            },
            "sk": {
                'S': event_metadata["sort_key"] 
            }
        })

    logger.info("Deleted image data from DynamoDB", extra=response)
    
    return response

