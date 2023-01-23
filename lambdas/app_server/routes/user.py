from aws_lambda_powertools.event_handler.api_gateway import Router
from utils.logger import logger
from utils.db import app_db

router = Router()

@router.get("/user")
def get_user():
    return { "Hello": "World"}

@router.post("/user")
def post_user():
    logger.info("Event", extra={
        "json_body": router.current_event.json_body,
    })
    response = app_db.post_user_item(router.current_event.json_body)
    return response