import MapView from "./components/map/MapView";
import UserMenu from "./components/UserMenu";
import UploadPhotoIconButton from "./components/UploadPhotoButton";
import PhotoContainerModal from "./components/photos/PhotoContainerModal";
import { useAuth } from "./hooks/use-auth";

function App() {
  const { isSignedIn } = useAuth();

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapView />
      <UserMenu />
      {isSignedIn && <UploadPhotoIconButton />}
      <PhotoContainerModal />
    </div>
  );
}

export default App;
