import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";
import PhotoView from "./PhotoView";
import GalleryView from "./GalleryView";
import { usePhotoContainerStore } from "../../stores/photoContainerStore";
import { PHOTO_CONFIG } from "../../config";

const PhotoContainerModal = () => {
  const { isOpen, closeContainer, userSelectedPhoto } =
    usePhotoContainerStore();

  const handleClose = () => {
    closeContainer();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={PHOTO_CONFIG.MODAL_SIZE}>
      <ModalOverlay />
      <ModalContent alignItems="center" width="auto">
        {userSelectedPhoto ? <PhotoView /> : <GalleryView />}
      </ModalContent>
    </Modal>
  );
};

export default PhotoContainerModal;
