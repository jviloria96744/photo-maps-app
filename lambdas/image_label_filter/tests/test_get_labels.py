import pytest
import app

@pytest.mark.parametrize("label_object, expected", [
    ({'Name': 'Landmark', 'Confidence': 66.17167663574219, 'Instances': [], 'Parents': [], 'Aliases': [], 'Categories': [{'Name': 'Popular Landmarks'}]}, True),
    ({'Name': 'Head', 'Confidence': 65.19744110107422, 'Instances': [], 'Parents': [{'Name': 'Person'}], 'Aliases': [], 'Categories': [{'Name': 'Person Description'}]}, False),
    ({'Name': 'Colosseum', 'Confidence': 59.724212646484375, 'Instances': [], 'Parents': [{'Name': 'Landmark'}], 'Aliases': [], 'Categories': [{'Name': 'Popular Landmarks'}]}, True),
    ({"Test": "Hello"}, False)
])
def test_is_landmark(label_object, expected):
    assert app.is_landmark(label_object) == expected
    
labels_case_one = [
    {'Name': 'Landmark', 'Confidence': 66.17167663574219, 'Parents': [], 'Aliases': [], 'Categories': [{'Name': 'Popular Landmarks'}]},
    {'Name': 'Head', 'Confidence': 65.19744110107422, 'Parents': [{'Name': 'Person'}], 'Aliases': [], 'Categories': [{'Name': 'Person Description'}]},
    {'Name': 'Colosseum', 'Confidence': 59.724212646484375, 'Parents': [{'Name': 'Landmark'}], 'Aliases': [], 'Categories': [{'Name': 'Popular Landmarks'}]}
]

labels_case_two = [
    {'Name': 'Landmark', 'Confidence': 66.17167663574219, 'Parents': [], 'Aliases': [], 'Categories': [{'Name': 'Popular Landmarks'}]},
    {'Name': 'Head', 'Confidence': 95.19744110107422, 'Parents': [{'Name': 'Person'}], 'Aliases': [], 'Categories': [{'Name': 'Person Description'}]},
    {'Name': 'Colosseum', 'Confidence': 59.724212646484375, 'Parents': [{'Name': 'Landmark'}], 'Aliases': [], 'Categories': [{'Name': 'Popular Landmarks'}]}
]

labels_case_three = [
    {'Name': 'Land', 'Confidence': 66.17167663574219, 'Parents': [], 'Aliases': [], 'Categories': [{'Name': 'Popular Land'}]},
    {'Name': 'Head', 'Confidence': 65.19744110107422, 'Parents': [{'Name': 'Person'}], 'Aliases': [], 'Categories': [{'Name': 'Person Description'}]},
    {'Name': 'Colosseum', 'Confidence': 59.724212646484375, 'Parents': [{'Name': 'Land'}], 'Aliases': [], 'Categories': [{'Name': 'Popular Land'}]}
]
@pytest.mark.parametrize("labels, expected_length", [
    (labels_case_one, 3),
    (labels_case_two, 6),
    (labels_case_three, 0)
])
def test_label_filter(labels, expected_length):
    assert len(app.label_filter(labels)) == expected_length
    