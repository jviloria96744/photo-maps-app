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


if __name__ == '__main__':
    import boto3

    ddb_client = boto3.resource("dynamodb")
    db = DB('AppStack-dbtabledbtableddbtableBF58CEDE-WK4YX473H2VS', ddb_client)

    test_item = {
        'pk': "test_pk",
        "sk": "test_sk",
        "test_attribute": "test_attr"
    }

    db.put_item(test_item)