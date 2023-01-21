import pytest
import image.get_exif_data as get_exif_data

@pytest.mark.parametrize("lat_lng, ref, values, expected", [
    ("Lat", "N", [41, 53, 2379/100], 41.889941666666665),
    ("Lng", "E", [12, 29, 863/25],  12.492922222222221)
])
def test_lat_lng_calculator_valid_coordinates(lat_lng, ref, values, expected):
    assert get_exif_data.lat_lng_calculator(lat_lng, ref, values) == pytest.approx(expected)


@pytest.mark.parametrize("lat_lng, ref, values, expected", [
    ("Lat", "N", [90, 53, 2379/100], Exception),
    ("Lat", "S", [-90, -53, -2379/100], Exception),
    ("Lat", "N", ["a", 53, 2379/100], Exception),
    ("Lat", "N", [41, "b", 2379/100], Exception),
    ("Lat", "N", [41, 53, "c"], Exception),
    ("Lng", "E", [180, 29, 863/25],  Exception),
    ("Lng", "W", [-180, -29, -863/25],  Exception),
    ("Lng", "E", ["a", 29, 863/25], Exception),
    ("Lng", "E", [180, "b", 863/25], Exception),
    ("Lng", "E", [180, 29, "c"], Exception)
])
def test_lat_lng_calculator_error(lat_lng, ref, values, expected):
    with pytest.raises(expected):
        get_exif_data.lat_lng_calculator(lat_lng, ref, values)


def test_convert_exif_date_to_iso():
    assert get_exif_data.convert_exif_date_to_iso("2017:05:29") == '2017-05-29'