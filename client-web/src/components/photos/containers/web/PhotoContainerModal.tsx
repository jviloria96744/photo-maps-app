import Dialog from "@mui/material/Dialog";
import ModalPhotoView from "./ModalPhotoView";
import ModalGalleryView from "./ModalGalleryView";
import { usePhotoStore } from "../../../../stores/photo-store";

const PhotoContainerModal = () => {
  const { isContainerOpen, closeContainer, userSelectedPhoto } =
    usePhotoStore();

  const handleClose = () => {
    closeContainer();
  };

  return (
    <Dialog open={isContainerOpen} onClose={handleClose}>
      {userSelectedPhoto ? <ModalPhotoView /> : <ModalGalleryView />}
    </Dialog>
  );
};

export default PhotoContainerModal;
