import { create } from "zustand";
import { PhotoObject } from "../models/photo";

interface PhotoStoreState {
  photos: PhotoObject[];
  setPhotos: (photos: PhotoObject[]) => void;
  isContainerOpen: boolean;
  selectedPhotoKeys: string[];
  userSelectedPhoto: string | null;
  closeContainer: () => void;
  openContainer: (selectedKeys: string[]) => void;
  setUserSelectedPhoto: (selectedPhoto: string | null) => void;
}

export const usePhotoStore = create<PhotoStoreState>()((set) => ({
  photos: [],
  setPhotos: (photos: PhotoObject[]) =>
    set((state) => ({ photos: [...state.photos, ...photos] })),

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
}));
