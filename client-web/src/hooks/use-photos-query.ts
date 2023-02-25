import { useEffect } from "react";
import { usePhotoStore } from "../stores/photo-store";
import { useAuth } from "./use-auth";
import { getPhotosByUser } from "../api/base-endpoints";
import { GeoPoint } from "../models/photo";
import { CallbackFunctionType } from "./use-subscription";

export const usePhotosQuery = () => {
  const { user } = useAuth();
  const { photos, setPhotos } = usePhotoStore();

  useEffect(() => {
    if (!user) {
      return;
    }

    getPhotosByUser().then((data) => {
      setPhotos(data);
    });

    return () => setPhotos([]);
  }, [user]);

  const refreshData: CallbackFunctionType = (event) => {
    console.log(event);
    // const incomingPhotos: GeoPoint[] = JSON.parse(
    //   event.data?.subscribe2channel?.data as string
    // );

    // const newPhotos = photos ? [...photos, ...incomingPhotos] : incomingPhotos;

    // setPhotos(newPhotos);
  };

  return {
    refreshData,
  };
};
