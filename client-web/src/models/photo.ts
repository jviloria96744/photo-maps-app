export type PresignedPostResponseFields = {
  key: string;
  AWSAccessKeyId: string;
  "x-amz-security-token": string;
  policy: string;
  signature: string;
};
export interface PresignedPostResponse {
  url: string;
  fields: PresignedPostResponseFields;
}

export interface GeoPoint {
  object_key: string;
  lat: string;
  lng: string;
}

export interface LocationData {
  country: string;
  country_code: string;
  city: string;
}

export interface ImageProperties {
  date: string;
  owner: string;
  image_height: string;
  image_width: string;
}
export interface PhotoObject {
  geo_point: GeoPoint;
  location_data: LocationData;
  image_properties: ImageProperties;
  image_labels: string[];
  object_key: string;
  datetime_created: string;
  datetime_updated: string;
  pk: string;
  sk: string;
}
