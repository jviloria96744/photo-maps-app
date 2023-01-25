import pytest
import utils.utilities as utils

def test_get_iso_timestamp():
    assert utils.get_iso_timestamp(1674171127611) == '2023-01-19T23:32:07.611000'


@pytest.mark.parametrize("epoch_milliseconds, expected", [
    (-10, Exception),
    ("abc", Exception),
    (None, Exception)
])
def test_get_iso_timestamp_error(epoch_milliseconds, expected):
    with pytest.raises(expected):
        utils.get_iso_timestamp(epoch_milliseconds)


@pytest.fixture
def user_post_event():
    return {
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "test_user_id",
                    "email": "test_username"
                }
            }
        }
    }

def test_get_user_data_from_event(user_post_event: dict):
    user_data = utils.get_user_data_from_event(user_post_event)
    assert len(user_data) == 2 


@pytest.mark.parametrize("user_data_index, expected", [
    (0, "test_user_id"),
    (1, "test_username"),
])
def test_get_user_data_from_event_correct_data(user_data_index: int, expected: str, user_post_event: dict):
    user_data = utils.get_user_data_from_event(user_post_event)
    assert user_data[user_data_index] == expected