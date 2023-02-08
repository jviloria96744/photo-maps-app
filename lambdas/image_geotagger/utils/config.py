import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    IMAGE_PROCESSOR_SECRET_NAME: str = os.getenv("IMAGE_PROCESSOR_SECRET_NAME")
    IMAGE_PROCESSOR_SECRET_KEY: str = os.getenv("IMAGE_PROCESSOR_SECRET_KEY")
    POWERTOOLS_SERVICE_NAME: str = os.getenv("POWERTOOLS_SERVICE_NAME")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL")
    AWS_REGION: str = os.getenv("AWS_REGION")
    GOOGLE_API_BASE_URL: str = "https://maps.googleapis.com/maps/api/geocode/json"