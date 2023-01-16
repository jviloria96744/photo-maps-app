import boto3
# from get_exif_data import get_exif_data_from_s3_image
# from get_labels import get_labels_from_s3_image
# from get_reverse_geocoding import get_reverse_geocoding

s3_client = boto3.client('s3')
rekognition_client = boto3.client("rekognition")

def get_event_metadata(event):
    # Implement actual logic to extract relevant metadata from event

    BUCKET_NAME = event.get("bucket_name")
    KEY = event.get("key")

    if not BUCKET_NAME or not KEY:
        raise Exception("Bucket Name and Key are required to process image")
    
    return {
        "bucket_name": event["bucket_name"],
        "key": event["key"]
    }

def handler(event, _):
    print(event)
    return 1
    # event_metadata = get_event_metadata(event)

    # exif_data = get_exif_data_from_s3_image(event_metadata["bucket_name"], event_metadata["key"], s3_client)

    # rev_geocode_data = get_reverse_geocoding(exif_data["lat"], exif_data["lng"])

    # label_data = get_labels_from_s3_image(event_metadata["bucket_name"], event_metadata["key"], rekognition_client)

    # db_item = {
    #     "geo_data": {
    #         **exif_data,
    #         **rev_geocode_data
    #     },
    #     "image_labels": label_data
    # }

    # return db_item


if __name__ == '__main__':
    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'
    
    event = {
        "bucket_name": BUCKET_NAME,
        "key": KEY_NAME
    }

    print(handler(event, None))