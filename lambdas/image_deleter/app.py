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
        return {
            "partition_key": user_id,
            "sort_key": f"IMAGE_{photo_id}"
        }
    except Exception as e:
        print(str(e))
        print(event)
        return None

        
def handler(event, _):
    event_metadata = get_event_metadata(event)
    if not event_metadata:
        return 1

    response = dynamodb_client.delete_item(
        TableName=os.getenv("DDB_TABLE_NAME"),
        Key={
            "pk": event_metadata["partition_key"],
            "sk": event_metadata["sort_key"]
        })
    
    return response

