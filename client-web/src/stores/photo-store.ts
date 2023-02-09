import { create } from "zustand";

interface PhotoStoreState {
  isContainerOpen: boolean;
  selectedPhotoKeys: string[];
  userSelectedPhoto: string | null;
  closeContainer: () => void;
  openContainer: (selectedKeys: string[]) => void;
  setUserSelectedPhoto: (selectedPhoto: string | null) => void;
}

export const usePhotoStore = create<PhotoStoreState>()((set) => ({
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
