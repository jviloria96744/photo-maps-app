import { useEffect } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePhotoStore } from "../stores/photo-store";
import { useAuth } from "./use-auth";
import { getPhotosByUser } from "../api/base-endpoints";
import { PhotoObject } from "../models/photo";
import { CallbackFunctionType } from "./use-subscription";

export const usePhotosQuery = () => {
  const { isSignedIn } = useAuth();
  const { photos, setPhotos } = usePhotoStore();

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    getPhotosByUser().then((data) => {
      setPhotos(data);
    });

    return () => setPhotos([]);
  }, [isSignedIn]);

  const refreshData: CallbackFunctionType = (event) => {
    const incomingPhotos: PhotoObject[] = JSON.parse(
      event.data?.subscribe2channel?.data as string
    );

    const newPhotos = photos ? [...photos, ...incomingPhotos] : incomingPhotos;

    setPhotos(newPhotos);
  };

  return {
    refreshData,
  };
};
