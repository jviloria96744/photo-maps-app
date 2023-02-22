import { Box } from "@chakra-ui/react";
import IconButton from "../../base/utility/IconButton";
import { MdDelete } from "react-icons/md";
import { usePhotoStore } from "../../../stores/photo-store";
import { useMedia } from "../../../hooks/use-media";
import { STYLING_CONFIG } from "../../../config";

const DeletePhotoButton = ({ photoKey }: { photoKey: string }) => {
  const { deletePhoto } = usePhotoStore();
  const { isMobile } = useMedia();
  return (
    <Box
      pos="absolute"
      top={
        isMobile
          ? STYLING_CONFIG.MOBILE_DRAWER_TOP_BUTTON_OFFSET
          : STYLING_CONFIG.WEB_MODAL_TOP_BUTTON_OFFSET
      }
      right={STYLING_CONFIG.MOBILE_DRAWER_LEFT_RIGHT_BUTTON_OFFSET}
    >
      <IconButton
        tooltipLabel="Delete Photo"
        ariaLabel="Delete Photo"
        IconComponent={MdDelete}
        clickHandler={() => deletePhoto(photoKey, isMobile)}
        boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
        variant={STYLING_CONFIG.MOBILE_ICON_VARIANT}
        color={STYLING_CONFIG.MOBILE_ICON_COLOR}
      />
    </Box>
  );
};

export default DeletePhotoButton;
