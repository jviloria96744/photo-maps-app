import IconButton from "../../../base/utility/IconButton";
import { PhotoUploadButtonProps } from "../types";
import "../styles.css";

const FileUploadButton = (props: PhotoUploadButtonProps) => {
  const { inputRef, handleUploadClick, handleFileChange, iconComponent } =
    props;

  return (
    <div className="photo-upload-button-web-container">
      <IconButton
        tooltipLabel="Upload Photo"
        IconComponent={iconComponent}
        ariaLabel="Upload Photo"
        clickHandler={handleUploadClick}
        photoUploadRef={inputRef}
        boxSize="50"
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
