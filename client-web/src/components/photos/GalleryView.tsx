import { ModalBody, Image } from "@chakra-ui/react";
import { usePhotoStore } from "../../stores/photo-store";
import { ENV } from "../../config";

const GalleryView = () => {
  const { selectedPhotoKeys, setUserSelectedPhoto } = usePhotoStore();
  const calculatedColumnCount = () => {
    if (selectedPhotoKeys.length === 1) {
      return [1];
    } else if (selectedPhotoKeys.length === 2) {
      return [1, 2];
    }

    return [1, 2, 3];
  };
  return (
    <ModalBody
      // Added to handle multi-photos
      w="100%"
      sx={{
        columnCount: calculatedColumnCount,
        columnGap: "8px",
      }}
    >
      {selectedPhotoKeys.map((key) => (
        <Image
          src={`${ENV.VITE_ASSETS_BASE_URL}${key}`}
          alt={key}
          key={key}
          maxWidth="100%"
          maxHeight="80vh"
          // Added to handle multi-photos
          mb={2}
          onClick={() => setUserSelectedPhoto(key)}
          _hover={{ cursor: "pointer" }}
        />
      ))}
    </ModalBody>
  );
};

export default GalleryView;
