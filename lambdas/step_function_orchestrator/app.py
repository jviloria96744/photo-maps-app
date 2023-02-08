import os
import json
import boto3
from aws_lambda_powertools import Logger

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))


client = boto3.client('stepfunctions')

def get_event_metadata(event: dict):
    try:
        event_metadata = json.loads(event["Records"][0]["body"])
        event_metadata = event_metadata["Records"][0]

        s3_object_key = event_metadata["s3"]["object"]["key"]

        return json.dumps({
            "object_key": s3_object_key,
        })
    except Exception as e:
        logger.debug(str(e), extra=event)
        raise Exception("Error extracting metadata from event object")

def handler(event, context):
    event_metadata = get_event_metadata(event)
    logger.info("Event", extra={"event_string": event_metadata})
    response = client.start_execution(
        stateMachineArn=os.getenv("STATE_MACHINE_ARN"),
        input=event_metadata
    )