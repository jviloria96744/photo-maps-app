import { ChangeEvent, useRef } from "react";
import { Box } from "@chakra-ui/react";
import IconButton from "./base/utility/IconButton";
import { MdImage } from "react-icons/md";
import { uploadPhotosToS3 } from "../api/upload-to-s3";

const UploadPhotoIconButton = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    uploadPhotosToS3(e.target.files);
  };

  return (
    <Box pos="absolute" bottom="5" right="5" _hover={{ cursor: "pointer" }}>
      <IconButton
        tooltipLabel="Upload Photo"
        IconComponent={MdImage}
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

export default UploadPhotoIconButton;
