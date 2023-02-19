import { useLocation } from "../../hooks/use-location";
import { useWindowSize } from "../../hooks/use-window-size";
import { ENV } from "../../config";

const StaticMapView = () => {
  const { longitude, latitude, zoom } = useLocation();
  const { width, height } = useWindowSize();

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${longitude},${latitude},${zoom},0.00,0.00/${Math.min(
    width,
    1280
  )}x${Math.min(height, 1280)}?access_token=${ENV.VITE_MAPBOX_ACCESS_TOKEN}`;

  return (
    <img
      alt="Default Map When Not Logged In"
      src={mapboxUrl}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default StaticMapView;
