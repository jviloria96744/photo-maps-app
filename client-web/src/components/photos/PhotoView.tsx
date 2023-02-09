import { Box, ModalBody, Image } from "@chakra-ui/react";
import IconButton from "../base/utility/IconButton";
import { MdChevronLeft } from "react-icons/md";
// import { usePhotoContainerStore } from "../../stores/photoContainerStore";
import { usePhotoStore } from "../../stores/photo-store";
import { ENV } from "../../config";

const PhotoView = () => {
  const { userSelectedPhoto, setUserSelectedPhoto } = usePhotoStore();

  return (
    <ModalBody>
      <Box pos="absolute" top="5">
        <IconButton
          tooltipLabel="Back To Gallery"
          ariaLabel="Back To Gallery"
          IconComponent={MdChevronLeft}
          clickHandler={() => setUserSelectedPhoto(null)}
          boxSize="38"
          variant="ghost"
          color="white"
        />
      </Box>
      <Image
        src={`${ENV.VITE_ASSETS_BASE_URL}${userSelectedPhoto}`}
        alt={userSelectedPhoto || ""}
        maxWidth="100%"
        maxHeight="80vh"
      />
    </ModalBody>
  );
};

export default PhotoView;
