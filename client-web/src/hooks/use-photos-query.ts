import { useEffect } from "react";
import { usePhotoStore } from "../stores/photo-store";
import { useAuth } from "./use-auth";
import { getPhotosByUser } from "../api/base-endpoints";
import { PhotoObject } from "../models/photo";
import { CallbackFunctionType } from "./use-subscription";

export const usePhotosQuery = () => {
  const { user } = useAuth();
  const { setPhotos, setInitialData } = usePhotoStore();

  useEffect(() => {
    if (!user) {
      return;
    }

    getPhotosByUser().then((data) => {
      setInitialData(data);
    });

    return () => setInitialData([]);
  }, [user]);

  const refreshData: CallbackFunctionType = (event) => {
    const incomingPhoto: PhotoObject = JSON.parse(
      event.data?.subscribe2channel?.data as string
    );

    setPhotos([incomingPhoto], true);
  };

  return {
    refreshData,
  };
};
