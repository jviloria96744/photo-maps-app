import boto3
from utils.config import Config


class DB:
    def __init__(self, table_name: str, db_client):
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


app_db = DB(Config.DDB_TABLE_NAME, boto3.resource("dynamo_db"))

