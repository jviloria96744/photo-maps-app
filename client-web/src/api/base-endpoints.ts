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
}) {
  return postCall("/photo", body);
}

export function getPhotosByUser() {
  return getCall("/photos");
}
