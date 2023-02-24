import boto3
from mypy_boto3_s3.client import S3Client
from utils.logger import logger
from utils.config import Config

class S3:
    def __init__(self, bucket_name: str, s3_client: S3Client):
        self.bucket_name = bucket_name
        self.s3_client = s3_client

    def create_presigned_url(self, object_name: str, expiration: int = 120):
        try:
            response = self.s3_client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=object_name,
                ExpiresIn=expiration,
                Fields={
                    "x-amz-meta-test": "TestValue"
                },
                Conditions=[
                {"x-amz-meta-test": "TestValue"}
                ]
            )
        except Exception:
            logger.exception("Error When Getting Presigned URL")
            raise

        return response
    
    def delete_item(self, object_name: str):
        try:
            response = self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
        except Exception:
            logger.exception("Error when deleting photo from bucket")
            raise

        return response


s3_client = boto3.client("s3")
asset_bucket = S3(Config.ASSET_BUCKET_NAME, s3_client)