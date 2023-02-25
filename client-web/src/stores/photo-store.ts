import { create } from "zustand";
import { GeoPoint } from "../models/photo";
import { deletePhoto } from "../api/base-endpoints";

interface PhotoStoreState {
  photos: GeoPoint[];
  isContainerOpen: boolean;
  selectedPhotoKeys: string[];
  userSelectedPhoto: string | null;
  closeContainer: () => void;
  openContainer: (selectedKeys: string[]) => void;
  setUserSelectedPhoto: (selectedPhoto: string | null) => void;
  setPhotos: (newPhotos: GeoPoint[]) => void;
  deletePhoto: (photoToDelete: string, isMobile: boolean) => void;
}

export const usePhotoStore = create<PhotoStoreState>()((set, get) => ({
  photos: [],
  isContainerOpen: false,
  selectedPhotoKeys: [],
  userSelectedPhoto: null,
  closeContainer: () =>
    set(() => ({
      isContainerOpen: false,
      selectedPhotoKeys: [],
      userSelectedPhoto: null,
    })),
  openContainer: (selectedKeys: string[]) =>
    set(() => ({ isContainerOpen: true, selectedPhotoKeys: selectedKeys })),
  setUserSelectedPhoto: (selectedPhoto) =>
    set(() => ({ userSelectedPhoto: selectedPhoto })),
  setPhotos: (newPhotos: GeoPoint[]) => {
    set(() => {
      return {
        photos: [...get().photos, ...newPhotos],
      };
    });
  },
  deletePhoto: (photoToDelete: string, isMobile: boolean) => {
    deletePhoto({ object_name: photoToDelete });

    // The ternary operator conditions are basically
    // (1) The photo view was from an individual photo marker click event
    // (2) The photo view was from an individual photo clicked within a gallery

    const newSelectedPhotoKeys =
      get().userSelectedPhoto || isMobile
        ? get().selectedPhotoKeys.filter((key) => key !== photoToDelete)
        : [];
    set(({ userSelectedPhoto, photos }) => {
      return {
        photos: photos?.filter((photo) => photo.object_key !== photoToDelete),
        selectedPhotoKeys: newSelectedPhotoKeys,
        userSelectedPhoto: null,
        isContainerOpen:
          (userSelectedPhoto || isMobile) && newSelectedPhotoKeys.length > 0
            ? true
            : false,
      };
    });
  },
}));
