import { Box } from "@chakra-ui/react";
import IconButton from "../base/utility/IconButton";
import { MdDelete } from "react-icons/md";
import { usePhotoStore } from "../../stores/photo-store";

const DeletePhotoButton = ({ photoKey }: { photoKey: string }) => {
  const { deletePhoto } = usePhotoStore();
  return (
    <Box pos="absolute" top="5" right="5">
      <IconButton
        tooltipLabel="Delete Photo"
        ariaLabel="Delete Photo"
        IconComponent={MdDelete}
        clickHandler={() => deletePhoto(photoKey)}
        boxSize="38"
        variant="ghost"
        color="white"
      />
    </Box>
  );
};

export default DeletePhotoButton;
