from reverse_geocode import search

def get_reverse_geocoding(lat, lng):
    rev_geocoding = None
    try:
        lat_float, lng_float = float(lat), float(lng)

        if lat_float < -90 or lat_float > 90 or lng_float < -180 or lng_float > 180:
            raise Exception("Invalid Lat/Lng Values")
            
        coordinates = [(lat_float, lng_float)]
        rev_geocoding = search(coordinates)
    except Exception as e:
        print(str(e))

    if rev_geocoding and len(rev_geocoding) > 0:
        return rev_geocoding[0]
    else:
        return {}

if __name__ == '__main__':
    print(get_reverse_geocoding(41.88994166666665, 12.492922222222221))
    print(get_reverse_geocoding(191.88994166666665, 12.492922222222221))