import { useEffect, useState, RefObject } from "react";
import { MapRef } from "react-map-gl";
import { useAuth } from "./use-auth";
import Supercluster, { PointFeature } from "supercluster";
import { BBox, GeoJsonProperties } from "geojson";
import useSupercluster from "use-supercluster";
import { PhotoObject } from "../models/photo";
import { getPhotosByUser } from "../api/base-endpoints";

const getMapBounds = (mapRef: RefObject<MapRef>): BBox => {
  return mapRef.current
    ? (mapRef.current.getMap().getBounds().toArray().flat() as BBox)
    : [0, 0, 0, 0];
};

export const usePhotos = ({
  zoom,
  mapRef,
}: {
  zoom: number;
  mapRef: RefObject<MapRef>;
}) => {
  const [pointList, setPointList] = useState<PointFeature<GeoJsonProperties>[]>(
    []
  );
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    getPhotosByUser().then((res: PhotoObject[]) => {
      const points: PointFeature<GeoJsonProperties>[] = res.map(
        (point: PhotoObject): PointFeature<GeoJsonProperties> => {
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
        }
      );

      setPointList(points);
    });
  }, [isSignedIn]);

  const { clusters, supercluster } = useSupercluster({
    points: pointList,
    zoom: zoom,
    bounds: getMapBounds(mapRef),
    options: {
      radius: 50,
    },
  });

  return {
    clusters,
    supercluster,
    pointList,
  };
};
