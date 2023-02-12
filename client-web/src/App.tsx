import MapView from "./components/map/MapView";
import UserMenu from "./components/UserMenu";
import UploadPhotoIconButton from "./components/UploadPhotoButton";
import PhotoContainerModal from "./components/photos/PhotoContainerModal";
import { useAuth } from "./hooks/use-auth";
import { useSubscription } from "./hooks/use-subscription";
import { usePhotosQuery } from "./hooks/use-photos-query";
import { User } from "./models/user";

function App() {
  const { isSignedIn, user } = useAuth();
  const { refreshData } = usePhotosQuery();
  useSubscription({
    channel: "channel",
    user: user as User,
    callbackFunction: refreshData,
  });

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
