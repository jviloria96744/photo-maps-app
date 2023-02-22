import { Drawer } from "@chakra-ui/react";
import DrawerGalleryView from "./DrawerGalleryView";
import { usePhotoStore } from "../../../../stores/photo-store";

const PhotoContainerDrawer = () => {
  const { isContainerOpen, closeContainer } = usePhotoStore();

  const handleCloseDrawer = () => {
    closeContainer();
  };

  return (
    <Drawer
      isOpen={isContainerOpen}
      onClose={handleCloseDrawer}
      placement="bottom"
      isFullHeight={true}
      size="full"
    >
      <DrawerGalleryView handleCloseDrawer={handleCloseDrawer} />
    </Drawer>
  );
};

export default PhotoContainerDrawer;
