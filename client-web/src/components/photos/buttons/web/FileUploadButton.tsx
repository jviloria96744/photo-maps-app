import IconButton from "../../../base/utility/IconButton";
import { PhotoUploadButtonProps } from "../types";
import { STYLING_CONFIG } from "../../../../config";
import "../styles.css";

const FileUploadButton = (props: PhotoUploadButtonProps) => {
  const { inputRef, handleUploadClick, handleFileChange, iconComponent } =
    props;

  return (
    <div className="photo-upload-button-web-container">
      <IconButton
        tooltipLabel="Upload Photo"
        IconComponent={iconComponent}
        clickHandler={handleUploadClick}
        boxSize={STYLING_CONFIG.WEB_ICON_BOX_SIZE}
      />

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/jpg,image/jpeg"
        multiple={true}
      />
    </div>
  );
};

export default FileUploadButton;
