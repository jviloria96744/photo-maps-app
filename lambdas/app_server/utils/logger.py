import os
from aws_lambda_powertools import Logger

logger = Logger(service=os.getenv("POWERTOOLS_SERVICE_NAME"), level=os.getenv("LOG_LEVEL"))