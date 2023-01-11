from io import BytesIO
import boto3
from get_exif_data import get_exif_data

s3_client = boto3.client('s3')

def get_event_metadata(event):
    # Implement actual logic to extract relevant metadata from event

    return {
        "bucket_name": event["bucket_name"],
        "key": event["key"]
    }

def handler(event, context):
    event_metadata = get_event_metadata(event)

    try:
        s3_response_object = s3_client.get_object(Bucket=event_metadata["bucket_name"], Key=event_metadata["key"])
        object_content = s3_response_object['Body'].read()
    except Exception as e:
        print(e)
        raise Exception("Error retrieving object from S3")

    exif_data = get_exif_data(BytesIO(object_content))
    return exif_data