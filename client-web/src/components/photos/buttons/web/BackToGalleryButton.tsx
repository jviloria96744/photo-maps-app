import { MdChevronLeft } from "react-icons/md";
import { usePhotoStore } from "../../../../stores/photo-store";
import IconButton from "../../../base/utility/IconButton";
import { STYLING_CONFIG } from "../../../../config";
import "../styles.css";

const BackToGalleryButton = () => {
  const { setUserSelectedPhoto } = usePhotoStore();
  return (
    <div className="photo-gallery-back-web-container">
      <IconButton
        tooltipLabel={null}
        IconComponent={MdChevronLeft}
        clickHandler={() => setUserSelectedPhoto(null)}
        boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
        color={STYLING_CONFIG.COLOR_SECONDARY}
      />
    </div>
  );
};

export default BackToGalleryButton;
