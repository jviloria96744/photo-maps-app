import { Suspense, lazy } from "react";
import { useMedia } from "../../../hooks/use-media";

const PhotoContainerDrawer = lazy(
  () => import("./mobile/PhotoContainerDrawer")
);

const PhotoContainerModal = lazy(() => import("./web/PhotoContainerModal"));

const PhotoContainer = () => {
  const { isMobile } = useMedia();

  return (
    <Suspense fallback={null}>
      {isMobile ? <PhotoContainerDrawer /> : <PhotoContainerModal />}
    </Suspense>
  );
};

export default PhotoContainer;
