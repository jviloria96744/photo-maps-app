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
