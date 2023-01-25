from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent
from aws_lambda_powertools.utilities.typing import LambdaContext
from routes import routers
from utils.logger import logger

cors_config = CORSConfig(allow_origin="*")
app = APIGatewayRestResolver(cors=cors_config)
for router in routers:
    app.include_router(router)


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
def handler(event: APIGatewayProxyEvent, context: LambdaContext) -> dict:
    return app.resolve(event, context)

