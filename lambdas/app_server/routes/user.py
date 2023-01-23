from aws_lambda_powertools.event_handler import Response 
from aws_lambda_powertools.event_handler.api_gateway import Router
from utils.logger import logger
from utils.db import app_db
from utils.utilities import get_iso_timestamp, get_user_data_from_event

router = Router()


@router.post("/user")
def post_user():
    try:
        logger.debug("Event", extra=router.current_event)
        epoch_timestamp = router.current_event["requestContext"]["requestTimeEpoch"]
        user_id, username = get_user_data_from_event(router.current_event)
        user_item = {
            "pk": user_id,
            "sk": f"USER_{user_id}",
            "username": username,
            "datetime_updated": get_iso_timestamp(epoch_timestamp)
        }

        logger.info("User Logged In", extra={
            "user_item": user_item
        })

        response = app_db.post_user_item(user_item)
        if response["ResponseMetadata"]["HTTPStatusCode"] == 200 and False:
            logger.info("User Login Successful")
            return response["Attributes"]
        else:
            raise
    except Exception:
        logger.exception("Error On User Login")
        return Response(
            status_code=500,
            body="Error On User Login"
        )


@router.delete("/user")
def delete_user():
    try:
        user_id, _ = get_user_data_from_event(router.current_event)
        user_item = {
            "pk": user_id,
            "sk": f"USER_{user_id}"
        }
        logger.info("Deleting User", extra={"user_item": user_item})

        response = app_db.delete_item(user_item)
        if response["ResponseMetadata"]["HTTPStatusCode"] == 200 and False:
            logger.info("User Delete Successful")
            return user_item
        else:
            raise
    except Exception:
        logger.exception("Error On User Delete")
        return Response(
            status_code=500,
            body="Error On User Delete"
        )