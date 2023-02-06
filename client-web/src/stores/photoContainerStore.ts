import { create } from "zustand";

interface PhotoContainerState {
  isOpen: boolean;
  selectedPhotoKeys: string[];
  userSelectedPhoto: string | null;
  closeContainer: () => void;
  openContainer: (selectedKeys: string[]) => void;
  setUserSelectedPhoto: (selectedPhoto: string | null) => void;
}

export const usePhotoContainerStore = create<PhotoContainerState>()((set) => ({
  isOpen: false,
  selectedPhotoKeys: [],
  userSelectedPhoto: null,
  closeContainer: () =>
    set(() => ({
      isOpen: false,
      selectedPhotoKeys: [],
      userSelectedPhoto: null,
    })),
  openContainer: (selectedKeys: string[]) =>
    set(() => ({ isOpen: true, selectedPhotoKeys: selectedKeys })),
  setUserSelectedPhoto: (selectedPhoto) =>
    set(() => ({ userSelectedPhoto: selectedPhoto })),
}));
