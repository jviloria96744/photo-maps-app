import json
import boto3
from aws_lambda_powertools.utilities.typing import LambdaContext
import image
from utils.db import DB
from utils.logger import logger
from utils.config import Config

s3_client = boto3.client('s3')
rekognition_client = boto3.client("rekognition")
dynamodb_resource = boto3.resource("dynamodb")

db = DB(Config.DDB_TABLE_NAME, dynamodb_resource)

def get_event_metadata(event):
    try:
        event_metadata = json.loads(event["Records"][0]["body"])
        event_metadata = event_metadata["Records"][0]

        s3_bucket_name = event_metadata["s3"]["bucket"]["name"]
        s3_object_key = event_metadata["s3"]["object"]["key"]
        datetime_created = event_metadata["eventTime"]
        
        # Object should have naming convention {user_id}/images/{image_id}
        split_key = s3_object_key.split("/")
        user_id, photo_id = split_key[0], split_key[2] 

        if not user_id or not photo_id:
            raise Exception("Key name is not in correct format")
            
        return {
            "bucket_name": s3_bucket_name,
            "key": s3_object_key,
            "datetime_created": datetime_created,
            "partition_key": user_id,
            "sort_key": f"IMAGE_{photo_id}"
        }
    except Exception:
        logger.exception("Error extracting metadata from event object")
        raise
        

@logger.inject_lambda_context(log_event=False)
def handler(event, context: LambdaContext):
    event_metadata = get_event_metadata(event)
    logger.info("Successfully extracted event metadata", extra=event_metadata)

    exif_data = image.get_exif_data_from_s3_image(event_metadata["bucket_name"], event_metadata["key"], s3_client)

    rev_geocode_data = image.get_reverse_geocoding_from_lat_lng(exif_data["lat"], exif_data["lng"])

    label_data = image.get_labels_from_s3_image(event_metadata["bucket_name"], event_metadata["key"], rekognition_client)

    db_item = {
        "pk": event_metadata["partition_key"],
        "sk": event_metadata["sort_key"],
        "datetime_created": event_metadata["datetime_created"],
        "metadata": {
            "geo_data": {
                **exif_data,
                **rev_geocode_data
            },
            "image_labels": label_data        
        },
        "object_key": event_metadata["key"]
    }

    logger.debug("Constructed item to write to Dynamo DB", extra=db_item)

    response = image.update_table_with_item(db_item, db)

    return response


if __name__ == '__main__':
    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'
    
    event = {
        "bucket_name": BUCKET_NAME,
        "key": KEY_NAME
    }

    print(handler(event, None))