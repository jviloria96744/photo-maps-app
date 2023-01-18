import json
import boto3
from get_exif_data import get_exif_data_from_s3_image
from get_labels import get_labels_from_s3_image
from get_reverse_geocoding import get_reverse_geocoding
from update_db_table import update_table_with_item

s3_client = boto3.client('s3')
rekognition_client = boto3.client("rekognition")
dynamodb_client = boto3.client("dynamodb")

def get_event_metadata(event):
    try:
        event_metadata = json.loads(event["Records"][0]["body"])
        event_metadata = event_metadata["Records"][0]

        s3_bucket_name = event_metadata["s3"]["bucket"]["name"]
        s3_object_key = event_metadata["s3"]["object"]["key"]
        user_id, photo_id = s3_object_key.split("/") 
        return {
            "bucket_name": s3_bucket_name,
            "key": s3_object_key,
            "partition_key": user_id,
            "sort_key": f"IMAGE_{photo_id}"
        }
    except Exception as e:
        print(str(e))
        raise Exception("Error when retrieving metadata from sqs event object")

def handler(event, _):
    event_metadata = get_event_metadata(event)

    exif_data = get_exif_data_from_s3_image(event_metadata["bucket_name"], event_metadata["key"], s3_client)

    rev_geocode_data = get_reverse_geocoding(exif_data["lat"], exif_data["lng"])

    label_data = get_labels_from_s3_image(event_metadata["bucket_name"], event_metadata["key"], rekognition_client)

    db_item = {
        "pk": event_metadata["partition_key"],
        "sk": event_metadata["sort_key"],
        "metadata": {
            "geo_data": {
                **exif_data,
                **rev_geocode_data
            },
            "image_labels": label_data        
        }
    }

    print(db_item)

    update_table_with_item(db_item, dynamodb_client)

    return 1


if __name__ == '__main__':
    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'
    
    event = {
        "bucket_name": BUCKET_NAME,
        "key": KEY_NAME
    }

    print(handler(event, None))