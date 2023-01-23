from datetime import datetime

def get_iso_timestamp(epoch_milliseconds: int) -> str:
    epoch_seconds = epoch_milliseconds / 1000
    return datetime.utcfromtimestamp(epoch_seconds).isoformat()

def get_user_data_from_event(event: dict) -> list[str]:
    cognito_object = event["requestContext"]["authorizer"]["claims"]
    user_id = cognito_object["cognito:username"]
    username = cognito_object["email"]

    return user_id, username