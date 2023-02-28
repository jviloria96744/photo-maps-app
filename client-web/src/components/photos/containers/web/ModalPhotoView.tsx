import DeletePhotoButton from "../../buttons/DeletePhotoButton";
import BackToGalleryButton from "../../buttons/web/BackToGalleryButton";
import { usePhotoStore } from "../../../../stores/photo-store";
import { ENV } from "../../../../config";

const PhotoView = () => {
  const { userSelectedPhoto, selectedPhotoKeys } = usePhotoStore();

  return (
    <>
      {selectedPhotoKeys.length > 1 && <BackToGalleryButton />}
      <DeletePhotoButton photoKey={userSelectedPhoto as string} />
      <img
        src={`${ENV.VITE_ASSETS_BASE_URL}${userSelectedPhoto}`}
        alt={userSelectedPhoto || ""}
      />
    </>
  );
};

export default PhotoView;
