from utils.logger import logger
from datetime import datetime

def get_iso_timestamp(epoch_milliseconds: int) -> str:
    try:
        if epoch_milliseconds < 0:
            raise
        epoch_seconds = epoch_milliseconds / 1000
        return datetime.utcfromtimestamp(epoch_seconds).isoformat()
    except Exception:
        logger.exception("Invalid Timestamp Input", extra={"epoch_milliseconds": epoch_milliseconds})
        raise Exception

def get_user_data_from_event(event: dict) -> list[str]:
    try:
        cognito_object = event["requestContext"]["authorizer"]["claims"]
        user_id = cognito_object["cognito:username"]
        username = cognito_object["email"]

        return user_id, username
    except Exception:
        logger.exception("Missing Cognito User Data", extra={
            "authorizer": event
        })
        raise Exception