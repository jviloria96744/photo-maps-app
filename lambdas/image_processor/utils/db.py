import os
from aws_lambda_powertools import Logger

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))

def update_table_with_item(item: dict, ddb_resource):
    try:
        TABLE_NAME = os.getenv("DDB_TABLE_NAME")
        if not TABLE_NAME:
            raise Exception("Table Name is Missing")

        ddb_table = ddb_resource.Table(TABLE_NAME)
        response = ddb_table.put_item(
            Item={
                'pk': item["pk"],
                "sk": item["sk"],
                "datetime_created": item["datetime_created"],
                "datetime_updated": item["datetime_created"], # On image creation, updated date is equal to created date
                "attribute_image_geo": create_attribute_image_geo(item["metadata"]["geo_data"]), # On image creation, updated date is equal to created date,
                "attribute_image_labels": item["metadata"]["image_labels"] 
            },
            ReturnValues="NONE",
            ReturnConsumedCapacity="NONE"
        )
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


if __name__ == '__main__':
    import boto3
    from dotenv import load_dotenv

    load_dotenv()

    ddb_resource = boto3.resource("dynamodb")
    # test_labels = [{'label_name': 'Amphitheatre', 'label_parents': [{'Name': 'Architecture'}, {'Name': 'Arena'}, {'Name': 'Building'}], 'label_aliases': [{'Name': 'Amphitheater'}], 'label_categories': [{'Name': 'Buildings and Architecture'}]}, {'label_name': 'Building', 'label_parents': [{'Name': 'Architecture'}], 'label_aliases': [], 'label_categories': [{'Name': 'Buildings and Architecture'}]}, {'label_name': 'Arena', 'label_parents': [{'Name': 'Architecture'}, {'Name': 'Building'}], 'label_aliases': [], 'label_categories': [{'Name': 'Buildings and Architecture'}]}, {'label_name': 'Architecture', 'label_parents': [], 'label_aliases': [], 'label_categories': [{'Name': 'Buildings and Architecture'}]}, {'label_name': 'Person', 'label_parents': [], 'label_aliases': [{'Name': 'Human'}], 'label_categories': [{'Name': 'Person Description'}]}, {'label_name': 'Landmark', 'label_parents': [], 'label_aliases': [], 'label_categories': [{'Name': 'Popular Landmarks'}]}, {'label_name': 'Colosseum', 'label_parents': [{'Name': 'Landmark'}], 'label_aliases': [], 'label_categories': [{'Name': 'Popular Landmarks'}]}]
    # test_item = {
    #     'pk': 'test',
    #     'sk': 'test',
    #     'datetime_created': 'test',
    #     'metadata': {
    #         'geo_data': {
    #             'image_date': 'test',
    #             'lat': 'test',
    #             'lng': 'test'
    #         },
    #         'image_labels': test_labels 
    #     }
    # }

    # update_table_with_item(test_item, ddb_resource)
    
    ddb_table = ddb_resource.Table(os.getenv("DDB_TABLE_NAME"))
    test_item = ddb_table.get_item(
        Key={
            'pk': "test",
            'sk': 'test'
        })

    print(str(test_item))