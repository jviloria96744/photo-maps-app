def is_landmark(label_object):
    if label_object["Name"] == 'Landmark':
        return True

    if label_object["Parents"] and len([parent for parent in label_object["Parents"] if parent["Name"] == 'Landmark']) > 0:
        return True

    if label_object["Categories"] and len([category for category in label_object["Categories"] if 'Landmark' in category["Name"] == 'Landmark']) > 0:
        return True

    return False


def get_labels(s3_image_options, rekognition_client):

    try:
        rekognition_response = rekognition_client.detect_labels(
            Features=["GENERAL_LABELS"], 
            Image={'S3Object': s3_image_options})
        labels = rekognition_response.get("Labels")
        returned_labels = []
        for label in labels:
            if label["Confidence"] > 90 or is_landmark(label):
                returned_labels.append({
                    "label_name": label.get("Name"),
                    "label_parents": label.get("Parents"),
                    "label_aliases": label.get("Aliases"),
                    "label_categories": label.get("Categories")
                })
    except Exception as e:
        print(str(e))
        return []
    
    
    return returned_labels

if __name__ == '__main__':
    import boto3

    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'

    s3_options = {
        'Bucket': BUCKET_NAME,
        'Name': KEY_NAME
    }

    rekognition_client = boto3.client('rekognition')
    rekognition_object = get_labels(s3_options, rekognition_client)
    print(rekognition_object)