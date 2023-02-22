import { Suspense, lazy } from "react";
import { useMedia } from "../../../hooks/use-media";

const CapturePhotoButton = lazy(() => import("./mobile/CapturePhotoButton"));

const FileUploadButton = lazy(() => import("./web/FileUploadButton"));

const PhotoUploadButton = () => {
  const { isMobile } = useMedia();

  return (
    <Suspense fallback={null}>
      {isMobile ? <CapturePhotoButton /> : <FileUploadButton />}
    </Suspense>
  );
};

export default PhotoUploadButton;
