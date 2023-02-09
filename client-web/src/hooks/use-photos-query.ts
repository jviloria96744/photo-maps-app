import { useQuery } from "react-query";
import { getPhotosByUser } from "../api/base-endpoints";
import { PhotoObject } from "../models/photo";

export const usePhotosQuery = () => {
  const { data } = useQuery<PhotoObject[], Error>(["photos"], getPhotosByUser);

  return {
    data,
  };
};
