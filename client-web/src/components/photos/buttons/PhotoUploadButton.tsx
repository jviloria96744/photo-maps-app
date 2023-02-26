import { Suspense, lazy, useRef, ChangeEvent } from "react";
import { MdImage, MdPhotoCamera } from "react-icons/md";
import { uploadPhotosToS3 } from "../../../api/upload-to-s3";
import { usePhotoStore } from "../../../stores/photo-store";
import { useMedia } from "../../../hooks/use-media";

const CapturePhotoButton = lazy(() => import("./mobile/CapturePhotoButton"));

const FileUploadButton = lazy(() => import("./web/FileUploadButton"));

const PhotoUploadButton = () => {
  const { isMobile } = useMedia();
  const { setGeoPoints } = usePhotoStore();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    uploadPhotosToS3(e.target.files, setGeoPoints);

    if (inputRef.current?.value) {
      inputRef.current.value = "";
    }
  };

  return (
    <Suspense fallback={null}>
      {isMobile ? (
        <CapturePhotoButton
          inputRef={inputRef}
          handleUploadClick={handleUploadClick}
          handleFileChange={handleFileChange}
          iconComponent={MdPhotoCamera}
        />
      ) : (
        <FileUploadButton
          inputRef={inputRef}
          handleUploadClick={handleUploadClick}
          handleFileChange={handleFileChange}
          iconComponent={MdImage}
        />
      )}
    </Suspense>
  );
};

export default PhotoUploadButton;
