import { getCall, postCall, deleteCall } from "./base";

// Exists only to test API
export function getPing() {
  return getCall("/ping/");
}

export function postUser() {
  return postCall("/user");
}

export function deleteUser() {
  return deleteCall("/user");
}
