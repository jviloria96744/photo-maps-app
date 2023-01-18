from io import BytesIO
import os
import exifread
from aws_lambda_powertools import Logger

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))


def get_exif_data_from_s3_image(bucket_name: str, key: str, s3_client):

    try:
        s3_response_object = s3_client.get_object(Bucket=bucket_name, Key=key)
        object_content = s3_response_object['Body'].read()
    except Exception as e:
        logger.debug(str(e))
        raise Exception("Error retrieving file from S3")

    return get_exif_data(object_content)

def lat_lng_calculator(lat_lng: str, ref: str, values: list[int]) -> float:
    try:
        decimal = sum([float(values[i]) / 60 ** i for i in range(3)])
        
        if (lat_lng == "Lat" and (decimal < -90 or decimal > 90)) or (lat_lng == "Lng" and (decimal < -180 or decimal > 180)):
            raise Exception("Lat/Lng value is out of bounds")  

        if (lat_lng == "Lat" and ref == "S") or (lat_lng == "Lng" and ref == "W"):
            decimal = -1 * decimal

    except Exception as e:
        logger.debug(str(e))
        raise Exception("Error converting lat/lng to decimal values")
        
    return decimal


def convert_exif_date_to_iso(date_string) -> str:
    if type(date_string) is not str:
        date_string = ''
    return date_string.replace(":", "-")

def get_exif_data(image):
    image_file = BytesIO(image)
    
    exif_dict = {}
    try:
        tags = exifread.process_file(image_file, details=False)
        # for (k, v) in tags.items():
        #     print("Tag: " + k + ", Value: " + str(v.values))
        
        if "GPS GPSLatitude" not in tags or "GPS GPSLongitude" not in tags:
            raise Exception("Image contains no GPS Data")


        exif_dict = {
            "date": convert_exif_date_to_iso(tags["GPS GPSDate"].values), 
            "image_width": str(tags["Image ImageWidth"].values[0]),
            "image_length": str(tags["Image ImageLength"].values[0]),
            "lat": str(lat_lng_calculator(
                "Lat", tags["GPS GPSLatitudeRef"].values, tags["GPS GPSLatitude"].values
            )),
            "lng": str(lat_lng_calculator(
                "Lng", tags["GPS GPSLongitudeRef"].values, tags["GPS GPSLongitude"].values
            )),
        }

    except Exception as e:
        logger.debug(str(e))
        raise Exception("Error extracting exif data from image")

    return exif_dict

if __name__ == '__main__':
    import boto3

    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'
    s3_client = boto3.client('s3')
    
    print(get_exif_data_from_s3_image(BUCKET_NAME, KEY_NAME, s3_client))