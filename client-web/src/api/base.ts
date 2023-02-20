import axios, { AxiosRequestConfig } from "axios";
import { getIdToken } from "./utils";
import { ENV } from "../config";

const baseAxiosConfig: AxiosRequestConfig = {
  baseURL: ENV.VITE_BASE_API_URL,
};

export const baseApi = axios.create(baseAxiosConfig);

baseApi.interceptors.request.use(
  async (config) => {
    const idToken = await getIdToken();
    config.headers["Content-Type"] = "application/json";
    config.headers["Authorization"] = idToken;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getCall(endpoint: string) {
  return baseApi
    .get(endpoint)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function postCall(endpoint: string, body: any = {}) {
  return baseApi
    .post(endpoint, body)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function putCall(endpoint: string, body: any = {}) {
  return baseApi
    .put(endpoint, body)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function deleteCall(endpoint: string, body: any = {}) {
  return baseApi
    .delete(endpoint, { data: body })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}
