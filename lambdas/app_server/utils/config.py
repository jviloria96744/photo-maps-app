import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    POWERTOOLS_SERVICE_NAME: str = os.getenv("POWERTOOLS_SERVICE_NAME")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL")
    DDB_TABLE_NAME: str = os.getenv("DDB_TABLE_NAME")
    AWS_REGION: str = os.getenv("AWS_REGION")
    ASSET_BUCKET_NAME: str = os.getenv("ASSET_BUCKET_NAME")