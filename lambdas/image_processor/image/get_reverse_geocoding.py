import os
import requests
from utils.secrets import get_secret
from dotenv import load_dotenv
from utils.logger import logger

load_dotenv()


def are_valid_inputs(lat: str, lng: str) -> bool:
    try:
        lat_float, lng_float = float(lat), float(lng)

        if lat_float < -90 or lat_float > 90 or lng_float < -180 or lng_float > 180:
            return False
    except:
        return False

    return True

def get_reverse_geocoding(lat: str, lng: str) -> dict:
    if not are_valid_inputs(lat, lng):
        logger.debug("Invalid Lat/Lng Values", extra={"Lat": lat, "Lng": lng})
        return {}

    rev_geocoding = {}

    try:
        base_url = "https://maps.googleapis.com/maps/api/geocode/json"
        latlng = f"?latlng={lat},{lng}"
        api_key = get_secret(os.getenv("IMAGE_PROCESSOR_SECRET_NAME"), os.getenv("IMAGE_PROCESSOR_SECRET_KEY"))
        key = f"&key={api_key}"
        
        url = "".join((base_url, latlng, key))
        
        response = requests.get(url)
        address_components = response.json()["results"][0]["address_components"]
        for add_part in address_components:
            if "country" in add_part["types"]:
                rev_geocoding["country"] = add_part["long_name"]
                rev_geocoding["country_code"] = add_part["short_name"]

            if "locality" in add_part["types"]:
                rev_geocoding["city"] = add_part["long_name"]
        
    except Exception:
        logger.exception("Warning: Reverse Geocoding Unsuccessful")

    return rev_geocoding
    

if __name__ == '__main__':
    print(get_reverse_geocoding(41.88994166666665, 12.492922222222221))
    print(get_reverse_geocoding(191.88994166666665, 12.492922222222221))