import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";
import ModalPhotoView from "./ModalPhotoView";
import ModalGalleryView from "./ModalGalleryView";
import { usePhotoStore } from "../../../../stores/photo-store";
import { PHOTO_CONFIG } from "../../../../config";

const PhotoContainerModal = () => {
  const { isContainerOpen, closeContainer, userSelectedPhoto } =
    usePhotoStore();

  const handleClose = () => {
    closeContainer();
  };

  return (
    <Modal
      isOpen={isContainerOpen}
      onClose={handleClose}
      size={PHOTO_CONFIG.MODAL_SIZE}
    >
      <ModalOverlay />
      <ModalContent alignItems="center" width="auto">
        {userSelectedPhoto ? <ModalPhotoView /> : <ModalGalleryView />}
      </ModalContent>
    </Modal>
  );
};

export default PhotoContainerModal;
