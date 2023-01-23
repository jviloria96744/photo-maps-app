from aws_lambda_powertools.event_handler.api_gateway import Router
from utils.logger import logger

router = Router()

@router.get("/user")
def get_user():
    return { "Hello": "World"}

@router.post("/user")
def post_user():
    logger.info("Event", extra={
        "json_body": router.current_event.json_body,
        "body": router.current_event.body
    })
    return router.current_event