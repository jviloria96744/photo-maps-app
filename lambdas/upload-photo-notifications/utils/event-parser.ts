interface PhotoObject {
  geo_point: {
    object_key: string;
    lng: string;
    lat: string;
  };
  location_data: {
    country: string;
    country_code: string;
    city: string;
  };
  image_properties: {
    date: string;
    owner: string;
    image_height: string;
    image_width: string;
  };
  datetime_updated: string;
  datetime_created: string;
  image_labels: any[];
  object_key: string;
  pk: string;
  sk: string;
}

export interface Event {
  bucket_name: string;
  object_key: string;
  user_id: string;
  result: {
    item: PhotoObject;
  };
}

export interface ParserResult {
  channel: string;
  data: string;
}

export const eventParser = (event: Event) => {
  const { result } = event;
  const userId = result.item.pk;

  const parsedItem = {
    ...result.item,
    image_labels: result.item.image_labels.map((label) => label.S),
  };

  return {
    channel: `channel-${userId}`,
    data: JSON.stringify(parsedItem),
  };
};
