from aws_lambda_powertools.event_handler.api_gateway import Router

router = Router()

@router.get("/ping")
def get_user():
    return { "response": "I am alive"}