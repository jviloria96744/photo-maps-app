import { useQuery } from "react-query";
import { getPhotosByUser } from "../api/base-endpoints";
import { PhotoObject } from "../models/photo";
import { CallbackFunctionType } from "./use-subscription";

export const usePhotosQuery = () => {
  const { data } = useQuery<PhotoObject[], Error>(["photos"], getPhotosByUser);

  const refreshData: CallbackFunctionType = (event) => {
    console.log(event);
  };

  return {
    data,
    refreshData,
  };
};
