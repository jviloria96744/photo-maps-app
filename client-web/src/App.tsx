import { lazy } from "react";
import StaticMapView from "./components/map/StaticMapView";
import PhotoUploadButton from "./components/photos/buttons/PhotoUploadButton";
import PhotoContainer from "./components/photos/containers/PhotoContainer";
import UserMenu from "./components/UserMenu";
import { useAuth } from "./hooks/use-auth";
import { useSubscription } from "./hooks/use-subscription";
import { usePhotosQuery } from "./hooks/use-photos-query";
import { User } from "./models/user";

const MapView = lazy(() => import("./components/map/MapView"));

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
      {isSignedIn ? <MapView /> : <StaticMapView />}
      <UserMenu />
      {isSignedIn && <PhotoUploadButton />}
      {isSignedIn && <PhotoContainer />}
    </div>
  );
}

export default App;
