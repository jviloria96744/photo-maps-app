import { Box } from "@chakra-ui/react";
import IconButton from "../../../base/utility/IconButton";
import { PhotoUploadButtonProps } from "../types";

const FileUploadButton = (props: PhotoUploadButtonProps) => {
  const { inputRef, handleUploadClick, handleFileChange, iconComponent } =
    props;

  return (
    <Box pos="absolute" bottom="5" right="5" _hover={{ cursor: "pointer" }}>
      <IconButton
        tooltipLabel="Upload Photo"
        IconComponent={iconComponent}
        ariaLabel="Upload Photo"
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
      />
    </Box>
  );
};

export default FileUploadButton;
