import os
from aws_lambda_powertools import Logger

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))

def update_table_with_item(item: dict, ddb_client):
    try:
        TABLE_NAME = os.getenv("DDB_TABLE_NAME")
        if not TABLE_NAME:
            raise Exception("Table Name is Missing")
        response = ddb_client.put_item(
            TableName=TABLE_NAME,
            Item={
                "pk": {
                    'S': item["pk"]
                },
                "sk": {
                    'S': item["sk"]
                },
                "datetime_created": {
                    'S': item["datetime_created"]
                },
                "datetime_updated": {
                    'S': item["datetime_created"] # On image creation, updated date is equal to created date
                },
                "attribute_image_geo": create_attribute_image_geo(item),
                "attribute_image_labels": {
                    'L': create_attribute_image_labels(item)
                }
            },
            ReturnValues="NONE",
            ReturnConsumedCapacity="NONE")
    except Exception as e:
        logger.info(str(e), extra=item)
        raise Exception("Error when writing to dynamodb table")

    return response


def create_attribute_image_geo(item):
    image_geo_data = item["metadata"]["geo_data"]
    return {
        'M': {
            "image_date": {
                'S': image_geo_data.get("date", '')
            },
            "lat": {
                'S': image_geo_data["lat"]
            },
            "lng": {
                'S': image_geo_data["lng"]
            },
            "country": {
                'S': image_geo_data.get("country", '')
            },
            "country_code": {
                'S': image_geo_data.get("country_code", '')
            },
            "city": {
                'S': image_geo_data.get("city", '')
            }
        }
    }


def create_attribute_image_labels(item):
    labels = item["metadata"]["image_labels"]
    if len(labels) == 0:
        return []

    label_list: list[dict] = []
    for label in labels:
        label_keys = ["label_name", "label_parents", "label_aliases", "label_categories"]
        label_object = {}
        for label_key in label_keys:
            label_object[label_key] = {
                'S': label.get(label_key)
            }
        label_list.append(label_object)
    
    return label_list