import { createContext } from "react";

interface ILocationContext {
  longitude: number;
  latitude: number;
  zoom: number;
}

export const LocationContext = createContext<ILocationContext>({
  longitude: 12.492922222222221,
  latitude: 41.88994,
  zoom: 15,
});
