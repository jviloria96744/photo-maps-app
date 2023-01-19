import os
from aws_lambda_powertools import Logger
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))
app = APIGatewayRestResolver()

@app.get("/user")
def get_user():
    return { "Hello": "World"}
    
@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
def handler(event: dict, context: LambdaContext) -> dict:
    logger.info("Event", extra=event)
    return app.resolve(event, context)