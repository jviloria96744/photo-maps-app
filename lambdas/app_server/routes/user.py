from aws_lambda_powertools.event_handler.api_gateway import Router
from utils.logger import logger
from utils.db import app_db
from utils.utilities import get_iso_timestamp, get_user_data_from_event

router = Router()

@router.get("/user")
def get_user():
    return { "Hello": "World"}

@router.post("/user")
def post_user():
    logger.info("Event", extra={
        "event": router.current_event,
    })
    epoch_timestamp = router.current_event["requestContext"]["requestTimeEpoch"]
    user_id, username = get_user_data_from_event(router.current_event)
    user_item = {
        "pk": user_id,
        "sk": f"USER_{user_id}",
        "username": username,
        "datetime_updated": get_iso_timestamp(epoch_timestamp)
    }
    response = app_db.post_user_item(user_item)
    return response