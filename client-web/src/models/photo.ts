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
  sk: string;
  object_key: string;
  lat: string;
  lng: string;
}

export interface ImageGeo {
  city?: string;
  country?: string;
  country_code?: string;
  image_date?: string;
  lat: string;
  lng: string;
}

export interface ImageLabel {
  label_aliases?: {
    Name: string;
  }[];
  label_categories?: {
    Name: string;
  }[];
  label_parents?: {
    Name: string;
  }[];
  label_name: string;
}
export interface PhotoObject {
  geo_data: ImageGeo;
  image_labels?: string; // This is a jsonified string with an ImageLabel structure
  object_key: string;
  datetime_created: string;
  datetime_updated: string;
  pk: string;
  sk: string;
}
