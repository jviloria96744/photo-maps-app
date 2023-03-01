import { create } from "zustand";
import { MapRef } from "react-map-gl";
import { GeoPoint, PhotoObject } from "../models/photo";
import { deletePhoto } from "../api/base-endpoints";
import { CallbackFunctionType } from "../hooks/use-subscription";

export type FilterOptionValue = {
  label: string;
  type: string;
};
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
  addNewPhotoFromWebsocketMessage: CallbackFunctionType;
  setPhotos: (photos: PhotoObject[], isAppend: boolean) => void;
  setInitialData: (photos: PhotoObject[]) => void;
  deletePhoto: (photoToDelete: string, isMobile: boolean) => void;

  // The references are repeated here to update the map when new geopoints are added to the map
  storeMapRef: React.RefObject<MapRef> | null;
  setMapRef: (mapRef: React.RefObject<MapRef> | null) => void;

  // These methods/properties are meant to manage the state of the search filter/filtered options
  getPhotoFilterOptions: () => FilterOptionValue[];
  selectedPhotoFilters: FilterOptionValue[];
  setSelectedPhotoFilters: (filters: FilterOptionValue[]) => void;
  filteredGeoPoints: GeoPoint[];
  setFilteredGeoPoints: () => void;
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
  openContainer: (selectedKeys: string[]) => {
    set(() => ({
      isContainerOpen: true,
      selectedPhotoKeys: selectedKeys,
      userSelectedPhoto: selectedKeys.length === 1 ? selectedKeys[0] : null,
    }));
  },
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

    get().setFilteredGeoPoints();
  },
  addNewPhotoFromWebsocketMessage: (event) => {
    const incomingPhoto: PhotoObject = JSON.parse(
      event.data?.subscribe2channel?.data as string
    );

    set((state) => ({ photos: [...state.photos, incomingPhoto] }));
  },
  setPhotos: (photos: PhotoObject[], isAppend: boolean) => {
    if (!isAppend) {
      set(() => ({ photos: photos }));
    } else {
      set((state) => ({ photos: [...state.photos, ...photos] }));
    }

    get().setFilteredGeoPoints();
  },
  setInitialData: (photos: PhotoObject[]) => {
    if (photos.length > 0) {
      set(() => ({
        geoPoints: photos.map((photo) => photo.geo_point),
        photos: photos,
        filteredGeoPoints: photos.map((photo) => photo.geo_point),
      }));

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
    set(({ userSelectedPhoto, photos, geoPoints, filteredGeoPoints }) => {
      return {
        photos: photos?.filter((photo) => photo.object_key !== photoToDelete),
        geoPoints: geoPoints?.filter(
          (geoPoint) => geoPoint.object_key !== photoToDelete
        ),
        filteredGeoPoints: filteredGeoPoints?.filter(
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

  getPhotoFilterOptions: () => {
    const locationOptions = new Set<string>();
    const contentOptions = new Set<string>();
    const optionsSet = new Set<string>();
    get().photos.forEach((photo) => {
      // TODO: Loop over location_data properties and add to locationOptions
      locationOptions.add(photo.location_data.city);
      locationOptions.add(photo.location_data.country_code);
      locationOptions.add(photo.location_data.country);

      photo.image_labels.forEach((label) => contentOptions.add(label));
    });

    const locationOptionsArray: FilterOptionValue[] = [...locationOptions]
      .sort()
      .map((location) => {
        return {
          label: location,
          type: "Location",
        };
      });
    const contentOptionsArray: FilterOptionValue[] = [...contentOptions]
      .sort()
      .map((content) => {
        return {
          label: content,
          type: "Content",
        };
      });
    return [...locationOptionsArray, ...contentOptionsArray].sort();
  },
  selectedPhotoFilters: [],
  setSelectedPhotoFilters: (filters: FilterOptionValue[]) => {
    set(() => ({ selectedPhotoFilters: filters }));
    get().setFilteredGeoPoints();
  },
  filteredGeoPoints: [],
  setFilteredGeoPoints: () => {
    if (get().selectedPhotoFilters.length === 0) {
      set((state) => ({ filteredGeoPoints: state.geoPoints }));
      return;
    }
    const selectedLocations = get()
      .selectedPhotoFilters.filter((filter) => filter.type === "Location")
      .map((filter) => filter.label);
    const selectedContent = get()
      .selectedPhotoFilters.filter((filter) => filter.type === "Content")
      .map((filter) => filter.label);
    const filteredPhotos = get().photos.filter((photo) => {
      const isSelectedLocation =
        selectedLocations.includes(photo.location_data.city) ||
        selectedLocations.includes(photo.location_data.country) ||
        selectedLocations.includes(photo.location_data.country_code);

      const isSelectedContent = photo.image_labels.some((label) =>
        selectedContent.includes(label)
      );
      return (
        (selectedLocations.length > 0 && isSelectedLocation) ||
        (selectedContent.length > 0 && isSelectedContent)
      );
    });

    const filteredPhotoKeys = filteredPhotos.map((photo) => photo.object_key);
    set((state) => ({
      filteredGeoPoints: state.geoPoints.filter((geoPoint) => {
        return filteredPhotoKeys.includes(geoPoint.object_key);
      }),
    }));
  },
}));
