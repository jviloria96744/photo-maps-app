from utils.logger import logger
from utils.db import DB


def update_table_with_item(item: dict, db_table):
    try:
        item_to_upload = {
            'pk': item["pk"],
            "sk": item["sk"],
            "datetime_created": item["datetime_created"],
            "datetime_updated": item["datetime_created"], # On image creation, updated date is equal to created date
            "attribute_image_geo": create_attribute_image_geo(item["metadata"]["geo_data"]), # On image creation, updated date is equal to created date,
            "attribute_image_labels": item["metadata"]["image_labels"]
        }

        response = db_table.put_item(item_to_upload)
    except Exception:
        logger.exception("Error when writing to dynamodb table")
        raise

    return response


def create_attribute_image_geo(image_geo_data):
    return {
        "image_date": image_geo_data.get("date", ''),
        "lat": image_geo_data["lat"],
        "lng": image_geo_data["lng"],
        "country": image_geo_data.get("country", ''),
        "country_code": image_geo_data.get("country_code", ''),
        "city": image_geo_data.get("city", '')
    }  
