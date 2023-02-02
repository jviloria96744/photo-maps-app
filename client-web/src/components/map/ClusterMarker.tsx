import { RefObject } from "react";
import { Marker, MapRef } from "react-map-gl";
import { PointFeature } from "supercluster";
import { GeoJsonProperties } from "geojson";
import "./map-view.css";

interface ClusterMarkerProps {
  cluster: PointFeature<GeoJsonProperties>;
  expansionZoom: number;
  mapRef: RefObject<MapRef>;
}
const ClusterMarker = ({
  cluster,
  expansionZoom,
  mapRef,
}: ClusterMarkerProps) => {
  const [longitude, latitude] = cluster.geometry.coordinates;
  const isCluster = cluster.properties?.cluster;
  const numPoints = cluster.properties?.point_count;
  const handleClick = () => {
    mapRef.current?.easeTo({
      center: [longitude, latitude],
      zoom: expansionZoom,
      duration: 1500,
    });
  };

  if (isCluster) {
    return (
      <Marker latitude={latitude} longitude={longitude} anchor="center">
        <div className="cluster-marker" onClick={handleClick}>
          {numPoints}
        </div>
      </Marker>
    );
  } else {
    return <Marker latitude={latitude} longitude={longitude} anchor="center" />;
  }
};

export default ClusterMarker;
