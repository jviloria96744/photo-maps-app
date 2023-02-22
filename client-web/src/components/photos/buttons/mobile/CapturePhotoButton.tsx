import { ChangeEvent, useRef } from "react";
import { Box } from "@chakra-ui/react";
import IconButton from "../../../base/utility/IconButton";
import { MdPhotoCamera } from "react-icons/md";
import { uploadPhotosToS3 } from "../../../../api/upload-to-s3";
import { useAuth } from "../../../../hooks/use-auth";
import { User } from "../../../../models/user";

const CapturePhotoButton = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    uploadPhotosToS3(e.target.files, user as User);

    if (inputRef.current?.value) {
      inputRef.current.value = "";
    }
  };

  return (
    <Box pos="absolute" top="5" left="5" _hover={{ cursor: "pointer" }}>
      <IconButton
        tooltipLabel="Capture Photo"
        IconComponent={MdPhotoCamera}
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
