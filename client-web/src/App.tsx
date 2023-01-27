import AppContainer from "./components/base/layout/AppContainer";
import MapView from "./components/map/MapView";
import UserMenu from "./components/UserMenu";
import UploadPhotoIconButton from "./components/UploadPhotoButton";
import { useAuth } from "./hooks/use-auth";
import { getPhotosByUser } from "./api/base-endpoints";

function App() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    getPhotosByUser().then((res) => {
      console.log(res);
    });
  }
  return (
    <AppContainer>
      <MapView />
      <UserMenu />
      {isSignedIn && <UploadPhotoIconButton />}
    </AppContainer>
  );
}

export default App;
