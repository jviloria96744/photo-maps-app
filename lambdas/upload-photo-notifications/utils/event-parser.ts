interface PhotoObject {
  geo_data: {
    date: string;
    country: string;
    country_code: string;
    image_length: string;
    lng: string;
    city: string;
    image_width: string;
    image_id: string;
    lat: string;
  };
  datetime_updated: string;
  datetime_created: string;
  image_labels: any[];
  object_key: string;
  pk: string;
  sk: string;
}
interface ImageProcessingResult {
  imageId: string;
  Bucket: string;
  userId: string;
  result: {
    item: PhotoObject;
    statusCode: number;
  };
}

export interface Event {
  bucket_name: string;
  object_key: string;
  result: ImageProcessingResult[];
}

export interface ParserResult {
  channel: string;
  data: string;
}

export const eventParser = (event: Event) => {
  const { result } = event;
  const userId = result[0].userId;

  const imageObjects = result
    .filter((res) => res.result.statusCode === 200)
    .map((res) => {
      return {
        ...res.result.item,
      };
    });

  return {
    channel: `channel-${userId}`,
    data: JSON.stringify(imageObjects),
  };
};
