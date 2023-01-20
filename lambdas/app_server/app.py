from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.data_classes import event_source, APIGatewayProxyEvent
from aws_lambda_powertools.utilities.typing import LambdaContext
from routes import routers
from utils.logger import logger

app = APIGatewayRestResolver()
for router in routers:
    logger.info("Using __init__.py")
    app.include_router(router)


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@event_source(data_class=APIGatewayProxyEvent)
def handler(event: APIGatewayProxyEvent, context: LambdaContext) -> dict:
    logger.info("Transformed Event?", extra=event)
    return app.resolve(event, context)

