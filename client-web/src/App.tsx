import AppContainer from "./components/base/layout/AppContainer";
import MapView from "./components/map/MapView";
import UserMenu from "./components/UserMenu";
import UploadPhotoIconButton from "./components/UploadPhotoButton";
import PhotoContainerModal from "./components/photos/PhotoContainerModal";
import { useAuth } from "./hooks/use-auth";

function App() {
  const { isSignedIn } = useAuth();
  return (
    <AppContainer>
      <MapView />
      <UserMenu />
      {isSignedIn && <UploadPhotoIconButton />}
      <PhotoContainerModal />
    </AppContainer>
  );
}

export default App;
