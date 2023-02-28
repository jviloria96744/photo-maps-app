import IconButton from "../../base/utility/IconButton";
import { MdDelete } from "react-icons/md";
import { usePhotoStore } from "../../../stores/photo-store";
import { useMedia } from "../../../hooks/use-media";
import { STYLING_CONFIG } from "../../../config";

const DeletePhotoButton = ({ photoKey }: { photoKey: string }) => {
  const { deletePhoto } = usePhotoStore();
  const { isMobile } = useMedia();
  return (
    <div
      className={
        isMobile
          ? "photo-delete-button-mobile-container"
          : "photo-delete-button-web-container"
      }
    >
      <IconButton
        tooltipLabel={null}
        IconComponent={MdDelete}
        clickHandler={() => deletePhoto(photoKey, isMobile)}
        boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
        color={STYLING_CONFIG.COLOR_SECONDARY}
      />
    </div>
  );
};

export default DeletePhotoButton;
