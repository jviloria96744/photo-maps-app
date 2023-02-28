import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { usePhotoStore } from "../../../../stores/photo-store";
import { ENV } from "../../../../config";
import "../styles.css";

const GalleryView = () => {
  const { selectedPhotoKeys, setUserSelectedPhoto } = usePhotoStore();

  return (
    <ImageList variant="masonry" gap={5}>
      {selectedPhotoKeys.map((key) => (
        <ImageListItem key={key}>
          <img
            src={`${ENV.VITE_ASSETS_BASE_URL}${key}`}
            alt={key}
            onClick={() => setUserSelectedPhoto(key)}
            className="photo-gallery-web-image"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default GalleryView;
