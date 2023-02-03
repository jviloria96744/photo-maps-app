import { create } from "zustand";

interface PhotoContainerState {
  isOpen: boolean;
  selectedPhotoKeys: string[];
  closeContainer: () => void;
  openContainer: (selectedKeys: string[]) => void;
}

export const usePhotoContainerStore = create<PhotoContainerState>()((set) => ({
  isOpen: false,
  selectedPhotoKeys: [],
  closeContainer: () => set(() => ({ isOpen: false, selectedPhotoKeys: [] })),
  openContainer: (selectedKeys: string[]) =>
    set(() => ({ isOpen: true, selectedPhotoKeys: selectedKeys })),
}));
