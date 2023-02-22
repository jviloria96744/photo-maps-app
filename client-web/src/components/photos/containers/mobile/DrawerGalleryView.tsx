import { useState } from "react";
import { DrawerContent, Box, Image } from "@chakra-ui/react";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";
import IconButton from "../../../base/utility/IconButton";
import DeletePhotoButton from "../../buttons/DeletePhotoButton";
import { usePhotoStore } from "../../../../stores/photo-store";
import { ENV, STYLING_CONFIG } from "../../../../config";

const DrawerGalleryView = ({
  handleCloseDrawer,
}: {
  handleCloseDrawer: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { selectedPhotoKeys } = usePhotoStore();

  const handleClose = () => {
    setActiveIndex(0);
    handleCloseDrawer();
  };
  const handleGalleryNavigation = (offset: number) => {
    // Javascript modulo is actually a remainder function so does not handle negative values well
    const newIndex = activeIndex + offset;
    if (newIndex === -1) {
      setActiveIndex(selectedPhotoKeys.length - 1);
    } else {
      setActiveIndex(newIndex % selectedPhotoKeys.length);
    }
  };

  // If the user deletes the last photo in the array, the index will be out of bounds, so we need to adjust it to the new last photo
  // For any other image, the index will remain the same, effectively shifting it right to the following image
  if (activeIndex === selectedPhotoKeys.length) {
    setActiveIndex(selectedPhotoKeys.length - 1);
  }

  return (
    <DrawerContent background="black">
      <Box pos="absolute" top="5" left="5">
        <IconButton
          tooltipLabel={null}
          ariaLabel="Close Photo Drawer"
          IconComponent={MdClose}
          clickHandler={() => handleClose()}
          boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
          variant={STYLING_CONFIG.MOBILE_ICON_VARIANT}
          color={STYLING_CONFIG.MOBILE_ICON_COLOR}
        />
      </Box>
      <Box pos="absolute" bottom="5">
        <IconButton
          tooltipLabel={null}
          ariaLabel="Move Left"
          IconComponent={MdChevronLeft}
          clickHandler={() => handleGalleryNavigation(-1)}
          boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
          variant={STYLING_CONFIG.MOBILE_ICON_VARIANT}
          color={STYLING_CONFIG.MOBILE_ICON_COLOR}
        />
      </Box>
      <Box pos="absolute" bottom="5" right="5">
        <IconButton
          tooltipLabel={null}
          ariaLabel="Move Left"
          IconComponent={MdChevronRight}
          clickHandler={() => handleGalleryNavigation(1)}
          boxSize={STYLING_CONFIG.MOBILE_ICON_BOX_SIZE}
          variant={STYLING_CONFIG.MOBILE_ICON_VARIANT}
          color={STYLING_CONFIG.MOBILE_ICON_COLOR}
        />
      </Box>
      <DeletePhotoButton photoKey={selectedPhotoKeys[activeIndex]} />
      {selectedPhotoKeys[activeIndex] && (
        <Image
          src={`${ENV.VITE_ASSETS_BASE_URL}${selectedPhotoKeys[activeIndex]}`}
          alt={selectedPhotoKeys[activeIndex]}
          top="0"
          bottom="0"
          left="0"
          right="0"
          margin="auto"
        />
      )}
    </DrawerContent>
  );
};

export default DrawerGalleryView;
