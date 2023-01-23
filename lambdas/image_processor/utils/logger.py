from aws_lambda_powertools import Logger
from dotenv import load_dotenv
from utils.config import Config

load_dotenv()

logger = Logger(service=Config.POWERTOOLS_SERVICE_NAME, level=Config.LOG_LEVEL)