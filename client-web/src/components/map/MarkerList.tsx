import { useState, useEffect } from "react";
import { Marker } from "pigeon-maps";
import { useAuth } from "../../hooks/use-auth";
import { getPhotosByUser } from "../../api/base-endpoints";
import { PhotoObject } from "../../models/photo";

const MarkerList = () => {
  const [markerList, setMarkerList] = useState<PhotoObject[]>([]);
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (isSignedIn) {
      getPhotosByUser().then((res: PhotoObject[]) => {
        setMarkerList(res);
      });
    }
  }, [isSignedIn]);

  return markerList.map((marker: PhotoObject) => {
    console.log(marker);
    console.log(parseFloat(marker.attribute_image_geo.lat));
    console.log(parseFloat(marker.attribute_image_geo.lng));
    return (
      <Marker
        width={33}
        anchor={[
          parseFloat(marker.attribute_image_geo.lat),
          parseFloat(marker.attribute_image_geo.lng),
        ]}
        // key={marker.sk}
      />
    );
  });
};

export default MarkerList;
