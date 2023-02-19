import React, { useState, useEffect, useContext } from "react";
import { LocationContext } from "../context/LocationContext";

export function ProvideLocation({ children }: React.PropsWithChildren) {
  const location = useProvideLocation();
  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);

interface Coordinates {
  latitude: number;
  longitude: number;
}

function useProvideLocation() {
  const [latLng, setLatLng] = useState<Coordinates>({
    longitude: 12.492922222222221,
    latitude: 41.88994,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setCoordinates);
    }
  }, []);

  const setCoordinates = (position: GeolocationPosition): void => {
    setLatLng({
      longitude: position?.coords?.longitude,
      latitude: position?.coords?.latitude,
    });
  };

  return {
    longitude: latLng.longitude,
    latitude: latLng.latitude,
    zoom: 15,
  };
}
