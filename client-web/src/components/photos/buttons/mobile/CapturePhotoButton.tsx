import { Box } from "@chakra-ui/react";
import IconButton from "../../../base/utility/IconButton";
import { PhotoUploadButtonProps } from "../types";

const CapturePhotoButton = (props: PhotoUploadButtonProps) => {
  const { inputRef, handleUploadClick, handleFileChange, iconComponent } =
    props;

  return (
    <Box pos="absolute" top="5" left="5" _hover={{ cursor: "pointer" }}>
      <IconButton
        tooltipLabel={null}
        IconComponent={iconComponent}
        ariaLabel="Capture Photo"
        clickHandler={handleUploadClick}
        photoUploadRef={inputRef}
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
    </Box>
  );
};

export default CapturePhotoButton;
