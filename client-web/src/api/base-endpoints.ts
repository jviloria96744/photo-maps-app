import { getCall, postCall, deleteCall } from "./base";

// Exists only to test API
export function getPing() {
  return getCall("/ping/");
}

// User Endpoints
export function postUser() {
  return postCall("/user");
}

export function deleteUser() {
  return deleteCall("/user");
}

// Photo(s) Endpoint
export function getPreSignedPost(body: {
  asset_uuid: string;
  asset_extension: string;
  endpoint: string;
  custom_fields: {
    [key: string]: string;
  };
}) {
  return postCall(body.endpoint, body);
}

export function getPhotosByUser() {
  return getCall("/photos");
}

export function deletePhoto(body: { object_name: string }) {
  return deleteCall("/photo", body);
}
