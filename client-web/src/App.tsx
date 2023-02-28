import { lazy } from "react";
import StaticMapView from "./components/map/StaticMapView";
import PhotoUploadButton from "./components/photos/buttons/PhotoUploadButton";
import PhotoContainer from "./components/photos/containers/PhotoContainer";
import UserMenu from "./components/UserMenu";
import SearchBar from "./components/search-bar/SearchBar";
import { useAuth } from "./hooks/use-auth";
import { useSubscription } from "./hooks/use-subscription";
import { usePhotosQuery } from "./hooks/use-photos-query";
import { User } from "./models/user";

const MapView = lazy(() => import("./components/map/MapView"));

function App() {
  const { user } = useAuth();
  const { refreshData } = usePhotosQuery();
  useSubscription({
    channel: "channel",
    user: user as User,
    callbackFunction: refreshData,
  });

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {user ? <MapView /> : <StaticMapView />}
      <UserMenu />
      {user && <SearchBar />}
      {user && <PhotoUploadButton />}
      {user && <PhotoContainer />}
    </div>
  );
}

export default App;
