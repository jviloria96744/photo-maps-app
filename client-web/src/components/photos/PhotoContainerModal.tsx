import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Image,
} from "@chakra-ui/react";
import { usePhotoContainerStore } from "../../stores/photoContainerStore";
import { ENV, PHOTO_CONFIG } from "../../config";

const PhotoContainerModal = () => {
  const { isOpen, closeContainer, selectedPhotoKeys } =
    usePhotoContainerStore();
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeContainer}
      size={PHOTO_CONFIG.MODAL_SIZE}
    >
      <ModalOverlay />
      <ModalContent alignItems="center" width="auto">
        <ModalBody>
          {selectedPhotoKeys.map((key) => (
            <Image
              src={`${ENV.VITE_ASSETS_BASE_URL}${key}`}
              alt={key}
              key={key}
              maxWidth="100%"
              maxHeight="80vh"
            />
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PhotoContainerModal;
