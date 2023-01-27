from aws_lambda_powertools.event_handler import Response 
from aws_lambda_powertools.event_handler.api_gateway import Router
from utils.logger import logger
from utils.utilities import get_user_data_from_event
from utils.s3 import asset_bucket
from utils.db import app_db

router = Router()

@router.post("/photo")
def get_presigned_post():
    try:
        body = router.current_event.json_body
        asset_uuid = body["asset_uuid"]
        asset_extension = body["asset_extension"]
        
        user_id, _ = get_user_data_from_event(router.current_event)
        
        object_key = f"{user_id}/{asset_uuid}.{asset_extension}"
        
        presigned_post_object = asset_bucket.create_presigned_url(object_key)

        return presigned_post_object
    except Exception:
        logger.exception("Error on presigned post")
        return Response(
            status_code=500,
            body="Error on presigned post"
        )


# These are slightly different resources but I am grouping them together in the same file because of similarity
@router.get("/photos")
def get_photos_by_user():
    try:
        user_id, _ = get_user_data_from_event(router.current_event)

        response = app_db.get_photos_by_user(user_id)

        return response
    except Exception:
        logger.exception("Error Fetching Photos")
        return Response(
            status_code=500,
            body="Error Fetching Photos"
        )