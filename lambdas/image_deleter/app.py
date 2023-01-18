import json
import os
import boto3

dynamodb_client = boto3.client("dynamodb")

def get_event_metadata(event):
    try:
        event_metadata = json.loads(event["Records"][0]["body"])
        event_metadata = event_metadata["Records"][0]

        s3_object_key = event_metadata["s3"]["object"]["key"]
        user_id, photo_id = s3_object_key.split("/") 
        
        if not user_id or not photo_id:
            raise Exception("Key name is not in correct format")

        return {
            "partition_key": user_id,
            "sort_key": f"IMAGE_{photo_id}"
        }
    except Exception as e:
        print(str(e))
        raise Exception("Error extracting metadata from event object")


def handler(event, _):
    event_metadata = get_event_metadata(event)
    if not event_metadata:
        return 1

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
    
    return response

