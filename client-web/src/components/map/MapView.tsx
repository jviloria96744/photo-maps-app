import { useState, useRef, useEffect } from "react";
import Map, { NavigationControl, MapRef, Marker } from "react-map-gl";
import { PhotoObject } from "../../models/photo";
import { useAuth } from "../../hooks/use-auth";
import { getPhotosByUser } from "../../api/base-endpoints";
import { BBox, GeoJsonProperties } from "geojson";
import { PointFeature } from "supercluster";
import { ENV } from "../../config/environment";
import useSupercluster from "use-supercluster";
import "./map-view.css";

interface ViewPort {
  latitude: number;
  longitude: number;
  zoom: number;
}
const MapView = () => {
  const initialViewPort: ViewPort = {
    longitude: 12.492922222222221,
    latitude: 41.88994,
    zoom: 15,
  };
  const [viewPort, setViewPort] = useState<ViewPort>(initialViewPort);
  const mapRef = useRef<MapRef>(null);

  const [pointList, setPointList] = useState<PointFeature<GeoJsonProperties>[]>(
    []
  );
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (isSignedIn) {
      getPhotosByUser().then((res: PhotoObject[]) => {
        const points: PointFeature<GeoJsonProperties>[] = res.map(
          (point: PhotoObject): PointFeature<GeoJsonProperties> => {
            const geoJsonPoint: PointFeature<GeoJsonProperties> = {
              type: "Feature",
              properties: {
                cluster: false,
                pointId: point.sk,
                category: "Photo",
              },
              geometry: {
                type: "Point",
                coordinates: [
                  parseFloat(point.attribute_image_geo.lng),
                  parseFloat(point.attribute_image_geo.lat),
                ],
              },
            };

            return geoJsonPoint;
          }
        );

        setPointList(points);
      });
    }
  }, [isSignedIn]);

  const bounds: BBox = mapRef.current
    ? (mapRef.current.getMap().getBounds().toArray().flat() as BBox)
    : [0, 0, 0, 0];

  const { clusters, supercluster } = useSupercluster({
    points: pointList,
    zoom: viewPort.zoom,
    bounds: bounds,
    options: {
      radius: 50,
    },
  });

  return (
    <Map
      {...viewPort}
      onMove={(evt) => setViewPort(evt.viewState)}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={ENV.VITE_MAPBOX_ACCESS_TOKEN}
      ref={mapRef}
    >
      <NavigationControl
        position="top-left"
        showZoom={true}
        showCompass={false}
      />
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const isCluster = cluster.properties?.cluster;
        const numPoints = cluster.properties?.point_count;

        if (isCluster) {
          return (
            <Marker
              key={cluster.id}
              latitude={latitude}
              longitude={longitude}
              anchor="center"
            >
              <div
                className="cluster-marker"
                onClick={async () => {
                  const expansionZoom = Math.min(
                    supercluster?.getClusterExpansionZoom(
                      cluster.id as number
                    ) || 20,
                    20
                  );

                  mapRef.current?.easeTo({
                    ...viewPort,
                    center: [longitude, latitude],
                    zoom: expansionZoom,
                    duration: 1500,
                  });
                }}
              >
                {numPoints}
              </div>
            </Marker>
          );
        } else {
          return (
            <Marker
              key={cluster.properties?.pointId}
              latitude={latitude}
              longitude={longitude}
              anchor="center"
            />
          );
        }
      })}
    </Map>
  );
};

export default MapView;
