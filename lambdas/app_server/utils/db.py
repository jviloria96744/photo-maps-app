import boto3
from utils.config import Config
from mypy_boto3_dynamodb.service_resource import DynamoDBServiceResource


class DB:
    def __init__(self, table_name: str, db_client: DynamoDBServiceResource):
        self.table_name = table_name
        self.db_client = db_client
        if not self.table_name:
            raise Exception("Table Name is Missing")
        self.table = db_client.Table(table_name)

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
                    date_created=if_not_exists(date_created, :last_login_date) 
                    date_updated=:last_login_date
            """,
            ExpressionAttributeValues={
                ':username': item["username"],
                ':last_login_date': item["lastLoginDate"]
            }

        )

        return response


ddb_resource: DynamoDBServiceResource = boto3.resource("dynamodb")
app_db = DB(Config.DDB_TABLE_NAME, ddb_resource)

