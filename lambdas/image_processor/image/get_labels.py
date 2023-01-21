from utils.logger import logger

def label_filter(labels: list[dict]) -> list[dict]:
    filtered_labels = [{
        "label_name": label.get("Name", ""),
        "label_parents": label.get("Parents", []),
        "label_aliases": label.get("Aliases", []),
        "label_categories": label.get("Categories", [])
    } for label in labels if label["Confidence"] > 90 or is_landmark(label)]
    
    return filtered_labels

def is_landmark(label_object: dict) -> bool:
    try:
        if label_object["Name"] == 'Landmark':
            return True

        if label_object["Parents"] and len([parent for parent in label_object["Parents"] if parent["Name"] == 'Landmark']) > 0:
            return True

        if label_object["Categories"] and len([category for category in label_object["Categories"] if 'Landmark' in category["Name"] == 'Landmark']) > 0:
            return True
    except:
        pass

    return False


def get_labels_from_s3_image(bucket_name: str, key: str, rekognition_client) -> list[dict]:
    s3_object_options = {
        "Bucket": bucket_name,
        "Name": key
    }

    try:
        rekognition_response = rekognition_client.detect_labels(
            Features=["GENERAL_LABELS"], 
            Image={'S3Object': s3_object_options})
        labels = label_filter(rekognition_response.get("Labels", []))
        
    except Exception:
        logger.exception("Warning: Unable to get labels from uploaded image")
        return []
    
    
    return labels

if __name__ == '__main__':
    import boto3

    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'

    rekognition_client = boto3.client('rekognition')
    rekognition_object = get_labels_from_s3_image(BUCKET_NAME, KEY_NAME, rekognition_client)
    print(rekognition_object)