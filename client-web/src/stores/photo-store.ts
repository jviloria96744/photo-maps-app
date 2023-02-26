import { create } from "zustand";
import { MapRef } from "react-map-gl";
import { GeoPoint, PhotoObject } from "../models/photo";
import { deletePhoto } from "../api/base-endpoints";

interface PhotoStoreState {
  photos: PhotoObject[];
  geoPoints: GeoPoint[];
  isContainerOpen: boolean;
  selectedPhotoKeys: string[];
  userSelectedPhoto: string | null;
  closeContainer: () => void;
  openContainer: (selectedKeys: string[]) => void;
  setUserSelectedPhoto: (selectedPhoto: string | null) => void;
  setGeoPoints: (geoPoints: GeoPoint[], isAppend: boolean) => void;
  setPhotos: (photos: PhotoObject[], isAppend: boolean) => void;
  setInitialData: (photos: PhotoObject[]) => void;
  deletePhoto: (photoToDelete: string, isMobile: boolean) => void;

  // The references are repeated here to update the map when new geopoints are added to the map
  storeMapRef: React.RefObject<MapRef> | null;
  setMapRef: (mapRef: React.RefObject<MapRef> | null) => void;
}

export const usePhotoStore = create<PhotoStoreState>()((set, get) => ({
  photos: [],
  geoPoints: [],
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
  setGeoPoints: (geoPoints: GeoPoint[], isAppend: boolean) => {
    if (!isAppend) {
      set(() => ({ geoPoints: geoPoints }));
    } else {
      set((state) => ({ geoPoints: [...state.geoPoints, ...geoPoints] }));
    }

    if (geoPoints.length > 0 && isAppend) {
      get().storeMapRef?.current?.flyTo({
        center: [parseFloat(geoPoints[0].lng), parseFloat(geoPoints[0].lat)],
        zoom: 12,
      });
    }
  },
  setPhotos: (photos: PhotoObject[], isAppend: boolean) => {
    if (!isAppend) {
      set(() => ({ photos: photos }));
    } else {
      set((state) => ({ photos: [...state.photos, ...photos] }));
    }
  },
  setInitialData: (photos: PhotoObject[]) => {
    if (photos.length > 0) {
      get().setGeoPoints(
        photos.map((photo) => photo.geo_point),
        false
      );
      get().setPhotos(photos, false);

      get().storeMapRef?.current?.easeTo({
        center: [
          parseFloat(photos[0].geo_point.lng),
          parseFloat(photos[0].geo_point.lat),
        ],
        zoom: 12,
      });
    }
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
    set(({ userSelectedPhoto, photos, geoPoints }) => {
      return {
        photos: photos?.filter((photo) => photo.object_key !== photoToDelete),
        geoPoints: geoPoints?.filter(
          (geoPoint) => geoPoint.object_key !== photoToDelete
        ),
        selectedPhotoKeys: newSelectedPhotoKeys,
        userSelectedPhoto: null,
        isContainerOpen:
          (userSelectedPhoto || isMobile) && newSelectedPhotoKeys.length > 0
            ? true
            : false,
      };
    });
  },

  storeMapRef: null,
  setMapRef: (mapRef) => set(() => ({ storeMapRef: mapRef })),
}));
