import IconButton from "../../../base/utility/IconButton";
import { PhotoUploadButtonProps } from "../types";
import { STYLING_CONFIG } from "../../../../config";
import "../styles.css";

const CapturePhotoButton = (props: PhotoUploadButtonProps) => {
  const { inputRef, handleUploadClick, handleFileChange, iconComponent } =
    props;

  return (
    <div className="photo-upload-button-mobile-container">
      <IconButton
        tooltipLabel={null}
        IconComponent={iconComponent}
        clickHandler={handleUploadClick}
        boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
      />

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/jpg,image/jpeg"
        multiple={true}
        capture
      />
    </div>
  );
};

export default CapturePhotoButton;
