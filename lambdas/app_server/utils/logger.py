from aws_lambda_powertools import Logger
from utils.config import Config

logger = Logger(service=Config.POWERTOOLS_SERVICE_NAME, level=Config.LOG_LEVEL)