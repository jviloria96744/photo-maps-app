from aws_lambda_powertools.event_handler.api_gateway import Router
from utils.logger import logger

router = Router()

@router.get("/user")
def get_user():
    logger.info("Current Event", extra=router.current_event.json_body)
    return { "Hello": "World"}