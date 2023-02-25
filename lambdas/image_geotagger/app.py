import boto3
from aws_lambda_powertools.utilities.typing import LambdaContext
import image
from utils.logger import logger

s3_client = boto3.client('s3')

def get_event_metadata(event):
    try:
        s3_bucket_name = event["bucket_name"]
        s3_object_key = event["object_key"] 
        image_id = s3_object_key.split("/")[-1]
        image_id = image_id.split(".")[0]

        if not s3_bucket_name or not s3_object_key:
            raise Exception("Key name is not in correct format")
            
        return {
            "bucket_name": s3_bucket_name,
            "key": s3_object_key,
            "image_id": image_id
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

    geotagged_data = {
        "geoPoint": {
            "object_key": event_metadata["key"],
            "lat": exif_data["lat"],
            "lng": exif_data["lng"]
        },
        "locationData": {
            **rev_geocode_data
        },
        "imageProperties": {
            "date": exif_data["date"],
            "image_width": exif_data["image_width"],
            "image_height": exif_data["image_height"],
            "owner": event["user_id"]
        },
        "image_id": event_metadata["image_id"]
    }

    logger.debug("Successfully extracted geo data from image", extra=geotagged_data)

    return geotagged_data


if __name__ == '__main__':
    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'
    
    event = {
        "bucket_name": BUCKET_NAME,
        "key": KEY_NAME
    }

    print(handler(event, None))