import { useState, useRef } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl";
import { usePhotos } from "../../hooks/use-photos";
import { useLocation } from "../../hooks/use-location";
import { ENV, MAP_CONFIG } from "../../config";
import ClusterMarker from "./ClusterMarker";
import Supercluster from "supercluster";

interface ViewPort {
  latitude: number;
  longitude: number;
  zoom: number;
}

const MapView = () => {
  const { latitude, longitude, zoom } = useLocation();
  const initialViewPort: ViewPort = {
    longitude: longitude,
    latitude: latitude,
    zoom: zoom,
  };
  const [viewPort, setViewPort] = useState<ViewPort>(initialViewPort);
  const mapRef = useRef<MapRef>(null);

  const { clusters, supercluster } = usePhotos({
    zoom: viewPort.zoom,
    mapRef,
  });

  return (
    <Map
      {...viewPort}
      reuseMaps={true}
      onMove={(evt) => setViewPort(evt.viewState)}
      mapStyle={MAP_CONFIG.STYLE}
      mapboxAccessToken={ENV.VITE_MAPBOX_ACCESS_TOKEN}
      ref={mapRef}
    >
      <NavigationControl
        position={MAP_CONFIG.NAVIGATION_CONTROL_POSITION}
        showZoom={true}
        showCompass={false}
      />
      {clusters.map((cluster) => {
        const expansionZoom = Math.min(
          supercluster?.getClusterExpansionZoom(cluster.id as number) || 20,
          20
        );

        return (
          <ClusterMarker
            key={
              cluster.properties?.cluster
                ? cluster.id
                : cluster.properties?.pointId
            }
            cluster={cluster}
            supercluster={supercluster as Supercluster}
            expansionZoom={expansionZoom}
            mapRef={mapRef}
          />
        );
      })}
    </Map>
  );
};

export default MapView;
