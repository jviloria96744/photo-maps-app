import boto3
from get_labels import get_labels

rekognition_client = boto3.client("rekognition")

def get_event_metadata(event):
    # Implement actual logic to extract relevant metadata from event

    return {
        "bucket_name": event["bucket_name"],
        "key": event["key"]
    }

def handler(event, context):
    event_metadata = get_event_metadata(event)

    try:
        s3_options = {
            "Bucket": event_metadata["bucket_name"],
            "Name": event_metadata["key"]
        }
        image_labels = get_labels(s3_options, rekognition_client) 
        return image_labels
    except Exception as e:
        print(str(e))
        raise Exception("Error detecting labels from uploaded image")

    return image_labels