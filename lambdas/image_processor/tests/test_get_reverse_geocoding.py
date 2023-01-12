import pytest
import get_reverse_geocoding

@pytest.mark.parametrize("key, expected", [
    ("country_code", "IT"),
    ("city", "Roma"),
    ("country", "Italy"),
])
def test_get_reverse_geocoding_valid(key, expected):
    lat, lng = 41.88994166666665, 12.492922222222221
    rev_geocode_data = get_reverse_geocoding.get_reverse_geocoding(lat, lng)

    assert rev_geocode_data[key] == expected


@pytest.mark.parametrize("lat, lng, expected", [
    (91.88994166666665, 12.492922222222221, {}),
    (-91.88994166666665, 12.492922222222221, {}),
    (41.88994166666665, 180.492922222222221, {}),
    (41.88994166666665, -180.492922222222221, {}),
    ("abc", 12.492922222222221, {}),
    (41.88994166666665, "abc", {})
])
def test_get_reverse_geocoding_invalid(lat, lng, expected):
    get_reverse_geocoding.get_reverse_geocoding(lat, lng)

    assert get_reverse_geocoding.get_reverse_geocoding(lat, lng) == expected