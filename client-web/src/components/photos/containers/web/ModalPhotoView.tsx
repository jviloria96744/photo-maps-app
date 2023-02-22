import { Box, ModalBody, Image } from "@chakra-ui/react";
import IconButton from "../../../base/utility/IconButton";
import { MdChevronLeft } from "react-icons/md";
import DeletePhotoButton from "../../buttons/DeletePhotoButton";
import { usePhotoStore } from "../../../../stores/photo-store";
import { ENV, STYLING_CONFIG } from "../../../../config";

const PhotoView = () => {
  const { userSelectedPhoto, setUserSelectedPhoto } = usePhotoStore();

  return (
    <ModalBody>
      <Box pos="absolute" top={STYLING_CONFIG.WEB_MODAL_TOP_BUTTON_OFFSET}>
        <IconButton
          tooltipLabel="Back To Gallery"
          ariaLabel="Back To Gallery"
          IconComponent={MdChevronLeft}
          clickHandler={() => setUserSelectedPhoto(null)}
          boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
          variant={STYLING_CONFIG.MOBILE_ICON_VARIANT}
          color={STYLING_CONFIG.MOBILE_ICON_COLOR}
        />
      </Box>
      <DeletePhotoButton photoKey={userSelectedPhoto as string} />
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
