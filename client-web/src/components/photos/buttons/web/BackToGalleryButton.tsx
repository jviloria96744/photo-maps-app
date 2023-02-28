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
        ariaLabel="Back To Gallery"
        IconComponent={MdChevronLeft}
        clickHandler={() => setUserSelectedPhoto(null)}
        boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
        variant={STYLING_CONFIG.MOBILE_ICON_VARIANT}
        color="secondary"
      />
    </div>
  );
};

export default BackToGalleryButton;
