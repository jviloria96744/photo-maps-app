from diagrams import Diagram, Edge, Cluster
from diagrams.onprem.client import Client
from diagrams.aws.network import APIGateway, CF
from diagrams.aws.security import Cognito
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb, DynamodbItem
from diagrams.aws.storage import SimpleStorageServiceS3
from diagrams.aws.integration import SF, SQS, Appsync
from diagrams.aws.ml import Rekognition

with Diagram("App Architecture", filename="diagrams/application_architecture/main_app"):

    asset_bucket = SimpleStorageServiceS3("Image Bucket")
    app_db = Dynamodb("App DB")
    appsync_websocket = Appsync("App Websocket")
    asset_cloudfront_distribution = CF("Asset Cloudfront Distribution")

    client = Client("Client")
    client >> Edge(label="Upload Photos To Bucket") >> asset_bucket
    client >> Edge(label="Push Processed Image Metadata To Client") << appsync_websocket
    asset_bucket >> asset_cloudfront_distribution >> client

    google_login = Cognito("Google Login/Hosted UI")  
    client >> Edge() << google_login
    app_auth = Cognito("Cognito Auth \n Google Identity Provider")
    google_login >> Edge() << app_auth
    appsync_websocket >> Edge() << app_auth

    with Cluster("REST API"):
        api_gw = APIGateway("App REST API")
        rest_api_lambda = Lambda("REST API Back-End")
        api_gw >> Edge() << rest_api_lambda
        client >> Edge() << api_gw >> Edge() << app_auth
        rest_api_lambda >> Edge(label="POST /photo \n DELETE /photo") << asset_bucket
        rest_api_lambda >> Edge(label="POST /User \n GET /photos") << app_db

    with Cluster("Image Processing Workflow"):
        with Cluster("S3 Upload Event Processor"):
            upload_queue = SQS("Upload Trigger Queue")
            lambda_step_function_trigger = Lambda("Step Function Trigger")
            upload_queue >> lambda_step_function_trigger
        
        asset_bucket >> upload_queue 
        lambda_step_function_trigger

        with Cluster("Image Processing Step Function"):
            with Cluster("Image Processing Parallel Task"):
                image_geotagger = Lambda("Image Geotagger")
                label_detector = Rekognition("Label Detector")
                label_filter = Lambda("Label Filter")

                lambda_step_function_trigger >> [image_geotagger, label_detector]
                label_detector >> label_filter

            put_item_job = DynamodbItem("Update Item Task")
            appsync_notification = Appsync("Publish to Appsync Task")

            label_filter >> put_item_job
            image_geotagger >> put_item_job
            put_item_job >> appsync_notification

    put_item_job >> app_db

    appsync_notification >> appsync_websocket

