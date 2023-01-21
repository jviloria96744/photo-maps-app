from aws_lambda_powertools.event_handler.api_gateway import Router
from utils.logger import logger

router = Router()

@router.get("/user")
def get_user():
    return { "Hello": "World"}