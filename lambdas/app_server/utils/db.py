import boto3
from utils.config import Config
from mypy_boto3_dynamodb.service_resource import DynamoDBServiceResource
from mypy_boto3_dynamodb.client import DynamoDBClient


class DB:
    def __init__(self, table_name: str, db_resource: DynamoDBServiceResource, db_client: DynamoDBClient):
        self.table_name = table_name
        self.db_resource = db_resource
        self.db_client = db_client
        if not self.table_name:
            raise Exception("Table Name is Missing")
        self.table = db_resource.Table(table_name)

    def put_item(self, item):
        response = self.table.put_item(
            Item=item,
            ReturnValues="NONE",
            ReturnConsumedCapacity="NONE")

        return response

    def post_user_item(self, item):
        response = self.table.update_item(
            Key={
                "pk": item["pk"],
                "sk": item["sk"]
            },
            ReturnValues="ALL_NEW",
            ReturnConsumedCapacity="NONE",
            UpdateExpression="""
                SET 
                    username=:username,
                    datetime_created=if_not_exists(datetime_created, :datetime_updated), 
                    datetime_updated=:datetime_updated
            """,
            ExpressionAttributeValues={
                ':username': item["username"],
                ':datetime_updated': item["datetime_updated"]
            }

        )

        return response

    def get_photos_by_user(self, user_id):
        response = self.db_client.query(
            TableName=self.table_name,
            KeyConditionExpression="pk=:user_id and begins_with(sk, 'IMAGE')",
            ExpressionAttributeValues={
                ":user_id": {
                    'S': user_id
                }
            }
        )

        return response
        

    def delete_item(self, item):
        response = self.table.delete_item(
            Key={
                "pk": item["pk"],
                "sk": item["sk"]
            },
            ReturnValues="NONE",
            ReturnConsumedCapacity="NONE"
        )

        return response


ddb_client = boto3.client("dynamodb")
ddb_resource: DynamoDBServiceResource = boto3.resource("dynamodb")
app_db = DB(Config.DDB_TABLE_NAME, ddb_resource, ddb_client)

