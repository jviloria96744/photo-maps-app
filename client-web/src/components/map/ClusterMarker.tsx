import { RefObject } from "react";
import { Marker, MapRef } from "react-map-gl";
import Supercluster, { PointFeature } from "supercluster";
import { GeoJsonProperties } from "geojson";
// import { usePhotoContainerStore } from "../../stores/photoContainerStore";
import { usePhotoStore } from "../../stores/photo-store";
import "./map-view.css";

interface ClusterMarkerProps {
  cluster: PointFeature<GeoJsonProperties>;
  supercluster: Supercluster;
  expansionZoom: number;
  mapRef: RefObject<MapRef>;
}
const ClusterMarker = ({
  cluster,
  supercluster,
  expansionZoom,
  mapRef,
}: ClusterMarkerProps) => {
  const [longitude, latitude] = cluster.geometry.coordinates;
  const isCluster = cluster.properties?.cluster;
  const numPoints = cluster.properties?.point_count;
  const handleZoomClick = () => {
    mapRef.current?.easeTo({
      center: [longitude, latitude],
      zoom: expansionZoom,
      duration: 1500,
    });
  };

  const openContainer = usePhotoStore((state) => state.openContainer);

  const handleMarkerClick = (
    cluster: PointFeature<GeoJsonProperties>
  ): void => {
    if (isCluster) {
      const clusterPoints = supercluster.getLeaves(
        cluster.properties?.cluster_id as number
      );
      const selectedKeys = clusterPoints.map((point) => {
        return point.properties?.objectKey || "";
      });
      openContainer(selectedKeys);
    } else {
      openContainer([cluster.properties?.objectKey || ""]);
    }
  };

  if (isCluster) {
    return (
      <Marker
        latitude={latitude}
        longitude={longitude}
        anchor="center"
        style={{ cursor: "pointer" }}
      >
        <div
          className="cluster-marker"
          onClick={() => handleMarkerClick(cluster)}
          onContextMenu={handleZoomClick}
        >
          {numPoints}
        </div>
      </Marker>
    );
  } else {
    return (
      <Marker
        latitude={latitude}
        longitude={longitude}
        anchor="center"
        style={{ cursor: "pointer" }}
        scale={1.5}
        onClick={() => handleMarkerClick(cluster)}
      />
    );
  }
};

export default ClusterMarker;
