import { lazy } from "react";
import LoginPage from "./components/login-page/LoginPage";
import StaticMapView from "./components/map/StaticMapView";
import PhotoUploadButton from "./components/photos/buttons/PhotoUploadButton";
import PhotoContainer from "./components/photos/containers/PhotoContainer";
import UserMenu from "./components/UserMenu";
import SearchBar from "./components/search-bar/SearchBar";
import { useAuth } from "./hooks/use-auth";
import { useSubscription } from "./hooks/use-subscription";
import { usePhotoStore } from "./stores/photo-store";
import { User } from "./models/user";

const MapView = lazy(() => import("./components/map/MapView"));

function App() {
  const { user } = useAuth();
  const { addNewPhotoFromWebsocketMessage } = usePhotoStore();
  useSubscription({
    channel: "channel",
    user: user as User,
    callbackFunction: addNewPhotoFromWebsocketMessage,
  });

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {!user ? (
        <LoginPage />
      ) : (
        <>
          <MapView />
          <UserMenu />
          <SearchBar />
          <PhotoUploadButton />
          <PhotoContainer />
        </>
      )}
    </div>
  );
}

export default App;
