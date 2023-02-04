import { RefObject } from "react";
import { MapRef } from "react-map-gl";
import { PointFeature } from "supercluster";
import { BBox, GeoJsonProperties } from "geojson";
import useSupercluster from "use-supercluster";
import { usePhotosQuery } from "./use-photos-query";
import { PhotoObject } from "../models/photo";

const getMapBounds = (mapRef: RefObject<MapRef>): BBox => {
  return mapRef.current
    ? (mapRef.current.getMap().getBounds().toArray().flat() as BBox)
    : [0, 0, 0, 0];
};

const transformPhotoObjects = (
  data: PhotoObject[]
): PointFeature<GeoJsonProperties>[] => {
  return data.map((point: PhotoObject): PointFeature<GeoJsonProperties> => {
    const geoJsonPoint: PointFeature<GeoJsonProperties> = {
      type: "Feature",
      properties: {
        cluster: false,
        pointId: point.sk,
        category: "Photo",
        objectKey: point.attribute_object_key,
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
  });
};

const createClusters = (
  data: PhotoObject[] | undefined,
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
  const { data, refetch } = usePhotosQuery();

  const refreshData = async () => {
    const { data } = await refetch();
    const { clusters, supercluster, points } = createClusters(
      data,
      zoom,
      mapRef
    );

    return {
      clusters,
      supercluster,
      points,
    };
  };

  const { clusters, supercluster, points } = createClusters(data, zoom, mapRef);

  return {
    clusters,
    supercluster,
    points,
    refreshData,
  };
};
