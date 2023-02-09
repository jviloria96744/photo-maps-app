# import json

def label_filter(labels: list[dict]) -> list[dict]:
    filtered_labels = [{
        "label_name": label.get("Name", ""),
        "label_parents": label.get("Parents", []),
        "label_aliases": label.get("Aliases", []),
        "label_categories": label.get("Categories", [])
    } for label in labels if (label["Confidence"] > 90 or is_landmark(label)) and label.get("Name", "") != 'Person']
    
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


def handler(event, context):
    try:
        return label_filter(event["result"]["imageLabels"])
    except:
        return []