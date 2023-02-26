from utils.logger import logger


def get_exif_data_from_s3_image(bucket_name: str, key: str, s3_client):

    try:
        s3_response_object = s3_client.head_object(Bucket=bucket_name, Key=key)
        logger.debug("S3 Response Object", extra=s3_response_object)
        object_content = s3_response_object['Metadata']
        exif_data = {
            "lat": object_content["latitude"],
            "lng": object_content["longitude"],
            "date": object_content["date"],
            "image_width": object_content["width"],
            "image_height": object_content["height"],
        }
    except Exception:
        logger.exception("Error retrieving file from S3")
        raise

    return exif_data

