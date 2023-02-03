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
  attribute_image_geo: ImageGeo;
  attribute_image_labels?: ImageLabel[];
  attribute_object_key: string;
  datetime_created: string;
  datetime_updated: string;
  pk: string;
  sk: string;
}
