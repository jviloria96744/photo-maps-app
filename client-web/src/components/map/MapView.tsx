import { useState, useEffect } from "react";
import { Map, Marker, Point, ZoomControl } from "pigeon-maps";
import { PhotoObject } from "../../models/photo";
import { useAuth } from "../../hooks/use-auth";
import { getPhotosByUser } from "../../api/base-endpoints";
import { ENV } from "../../config/environment";

const renderMarker = (marker: PhotoObject) => {
  return (
    <Marker
      width={33}
      anchor={[
        parseFloat(marker.attribute_image_geo.lat),
        parseFloat(marker.attribute_image_geo.lng),
      ]}
      key={marker.sk}
    />
  );
};
const mapboxProvider = (
  x: number,
  y: number,
  z: number,
  dpr?: number
): string => {
  return `https://api.mapbox.com/styles/v1/${
    ENV.VITE_MAPBOX_URL
  }/tiles/512/${z}/${x}/${y}${dpr && dpr >= 2 ? "@2x" : ""}?access_token=${
    ENV.VITE_MAPBOX_ACCESS_TOKEN
  }`;
};

const MapView = () => {
  const [center, setCenter] = useState<Point>([41.88994, 12.492922222222221]);
  const [zoom, setZoom] = useState(15);

  const [markerList, setMarkerList] = useState<PhotoObject[]>([]);
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (isSignedIn) {
      getPhotosByUser().then((res: PhotoObject[]) => {
        setMarkerList(res);
      });
    }
  }, [isSignedIn]);

  return (
    <Map
      provider={mapboxProvider}
      dprs={[1, 2]}
      center={center}
      zoom={zoom}
      onBoundsChanged={({ center, zoom }) => {
        setCenter(center);
        setZoom(zoom);
      }}
      animate={true}
      attribution={false}
      attributionPrefix={false}
    >
      <ZoomControl />
      {markerList.map((marker: PhotoObject) => {
        return renderMarker(marker);
      })}
    </Map>
  );
};

export default MapView;
