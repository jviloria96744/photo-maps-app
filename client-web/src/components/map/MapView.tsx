import { Suspense, useState, useRef, useEffect } from "react";
import Map, { NavigationControl, MapRef } from "react-map-gl";
import StaticMapView from "./StaticMapView";
import { usePhotos } from "../../hooks/use-photos";
import { useLocation } from "../../hooks/use-location";
import { useMedia } from "../../hooks/use-media";
import { ENV, MAP_CONFIG } from "../../config";
import ClusterMarker from "./ClusterMarker";
import Supercluster from "supercluster";
import { usePhotoStore } from "../../stores/photo-store";

interface ViewPort {
  latitude: number;
  longitude: number;
  zoom: number;
}

const MapView = () => {
  const { isMobile } = useMedia();
  const { latitude, longitude, zoom } = useLocation();
  const initialViewPort: ViewPort = {
    longitude: longitude,
    latitude: latitude,
    zoom: zoom,
  };
  const [viewPort, setViewPort] = useState<ViewPort>(initialViewPort);

  const { setMapRef } = usePhotoStore();
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (!mapRef) {
      return;
    }
    setMapRef(mapRef);

    return () => setMapRef(null);
  }, [mapRef]);

  const { clusters, supercluster } = usePhotos({
    zoom: viewPort.zoom,
    mapRef,
  });

  return (
    <Suspense fallback={<StaticMapView />}>
      <Map
        {...viewPort}
        reuseMaps={true}
        onMove={(evt) => setViewPort(evt.viewState)}
        mapStyle={MAP_CONFIG.STYLE}
        mapboxAccessToken={ENV.VITE_MAPBOX_ACCESS_TOKEN}
        ref={mapRef}
      >
        {!isMobile && (
          <NavigationControl
            position={MAP_CONFIG.NAVIGATION_CONTROL_POSITION}
            showZoom={true}
            showCompass={false}
          />
        )}

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
    </Suspense>
  );
};

export default MapView;
