import AppContainer from "./components/base/layout/AppContainer";
import MapView from "./components/map/MapView";
import UserMenu from "./components/UserMenu";
import UploadPhotoIconButton from "./components/UploadPhotoButton";
import { useAuth } from "./hooks/use-auth";

function App() {
  const { isSignedIn } = useAuth();
  return (
    <AppContainer>
      <MapView />
      <UserMenu />
      {isSignedIn && <UploadPhotoIconButton />}
    </AppContainer>
  );
}

export default App;
