import exifread


def lat_lng_calculator(lat_lng, ref, values):
    try:
        decimal = sum([float(values[i].num / values[i].den) / 60 ** i for i in range(3)])

        if (lat_lng == "Lat" and ref == "S") or (lat_lng == "Lng" and ref == "W"):
            decimal = -1 * decimal

    except Exception as e:
        print(str(e))
        raise Exception("Error converting lat/lng to decimal values")
        
    return decimal


def convert_exif_date_to_iso(date_string):
    return date_string.replace(":", "-")

def get_exif_data(image):
    
    exif_dict = {}
    try:
        tags = exifread.process_file(image, details=False)
        # for (k, v) in tags.items():
        #     print("Tag: " + k + ", Value: " + str(v.values))
        
        if "GPS GPSDate" not in tags:
            raise Exception("Image contains no GPS Data")


        exif_dict = {
            "date": convert_exif_date_to_iso(tags["GPS GPSDate"].values), 
            "image_width": str(tags["Image ImageWidth"].values[0]),
            "image_length": str(tags["Image ImageLength"].values[0]),
            "gps_lat": str(lat_lng_calculator(
                "Lat", tags["GPS GPSLatitudeRef"].values, tags["GPS GPSLatitude"].values
            )),
            "gps_lng": str(lat_lng_calculator(
                "Lng", tags["GPS GPSLongitudeRef"].values, tags["GPS GPSLongitude"].values
            )),
        }

    except Exception as e:
        print(str(e))
        raise Exception("Error extracting exif data from image")

    return exif_dict

if __name__ == '__main__':
    import boto3
    from io import BytesIO

    BUCKET_NAME = 'map-image-test'
    KEY_NAME = 'IMG_20170529_110527.jpg'
    s3_client = boto3.client('s3')
    s3_response_object = s3_client.get_object(Bucket=BUCKET_NAME, Key=KEY_NAME)
    object_content = s3_response_object['Body'].read()
    print(get_exif_data(BytesIO(object_content)))