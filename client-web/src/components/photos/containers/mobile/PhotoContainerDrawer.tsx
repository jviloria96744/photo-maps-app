import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import DrawerGalleryView from "./DrawerGalleryView";
import { usePhotoStore } from "../../../../stores/photo-store";

const PhotoContainerDrawer = () => {
  const { isContainerOpen, closeContainer } = usePhotoStore();

  const handleCloseDrawer = () => {
    closeContainer();
  };

  return (
    <SwipeableDrawer
      open={isContainerOpen}
      onOpen={() => {}}
      onClose={handleCloseDrawer}
      anchor="bottom"
      disableSwipeToOpen={true}
      PaperProps={{
        style: {
          height: "100%",
          background: "black",
        },
      }}
    >
      {isContainerOpen && (
        <DrawerGalleryView handleCloseDrawer={handleCloseDrawer} />
      )}
    </SwipeableDrawer>
  );
};

export default PhotoContainerDrawer;
