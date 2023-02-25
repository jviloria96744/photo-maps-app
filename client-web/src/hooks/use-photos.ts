import { RefObject } from "react";
import { MapRef } from "react-map-gl";
import { PointFeature } from "supercluster";
import { BBox, GeoJsonProperties } from "geojson";
import useSupercluster from "use-supercluster";
import { usePhotoStore } from "../stores/photo-store";
import { PhotoObject, GeoPoint } from "../models/photo";

const getMapBounds = (mapRef: RefObject<MapRef>): BBox => {
  return mapRef.current
    ? (mapRef.current.getMap().getBounds().toArray().flat() as BBox)
    : [0, 0, 0, 0];
};

const transformPhotoObjects = (
  data: GeoPoint[]
): PointFeature<GeoJsonProperties>[] => {
  return data.map((point: GeoPoint): PointFeature<GeoJsonProperties> => {
    const geoJsonPoint: PointFeature<GeoJsonProperties> = {
      type: "Feature",
      properties: {
        cluster: false,
        pointId: point.sk,
        category: "Photo",
        objectKey: point.object_key,
      },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(point.lng), parseFloat(point.lat)],
      },
    };

    return geoJsonPoint;
  });
};

const createClusters = (
  data: GeoPoint[],
  zoom: number,
  mapRef: RefObject<MapRef>
) => {
  const points: PointFeature<GeoJsonProperties>[] = !data
    ? []
    : transformPhotoObjects(data);

  const { clusters, supercluster } = useSupercluster({
    points: points,
    zoom: zoom,
    bounds: getMapBounds(mapRef),
    options: {
      radius: 50,
    },
  });
  return {
    clusters,
    supercluster,
    points,
  };
};

export const usePhotos = ({
  zoom,
  mapRef,
}: {
  zoom: number;
  mapRef: RefObject<MapRef>;
}) => {
  const { photos } = usePhotoStore();

  const { clusters, supercluster, points } = createClusters(
    photos || [],
    zoom,
    mapRef
  );

  return {
    clusters,
    supercluster,
    points,
  };
};
