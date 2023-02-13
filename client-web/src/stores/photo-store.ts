import { create } from "zustand";
import { PhotoObject } from "../models/photo";

interface PhotoStoreState {
  photos: PhotoObject[] | null;
  isContainerOpen: boolean;
  selectedPhotoKeys: string[];
  userSelectedPhoto: string | null;
  closeContainer: () => void;
  openContainer: (selectedKeys: string[]) => void;
  setUserSelectedPhoto: (selectedPhoto: string | null) => void;
  setPhotos: (newPhotos: PhotoObject[]) => void;
}

export const usePhotoStore = create<PhotoStoreState>()((set) => ({
  photos: null,
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
  setPhotos: (photos: PhotoObject[]) => {
    set(() => {
      return {
        photos,
      };
    });
  },
}));
