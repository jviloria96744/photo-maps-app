import { Suspense, lazy } from "react";
import StaticMapView from "./components/map/StaticMapView";
// import MapView from "./components/map/MapView";
import UserMenu from "./components/UserMenu";
import { useAuth } from "./hooks/use-auth";
import { useSubscription } from "./hooks/use-subscription";
import { usePhotosQuery } from "./hooks/use-photos-query";
import { User } from "./models/user";

const PhotoContainerModal = lazy(
  () => import("./components/photos/PhotoContainerModal")
);

const UploadPhotoIconButton = lazy(
  () => import("./components/UploadPhotoButton")
);

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
      {isSignedIn ? (
        <Suspense fallback={<StaticMapView />}>
          <MapView />
        </Suspense>
      ) : (
        <StaticMapView />
      )}
      <UserMenu />
      {isSignedIn && (
        <Suspense fallback={null}>
          <UploadPhotoIconButton />
        </Suspense>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <PhotoContainerModal />
      </Suspense>
    </div>
  );
}

export default App;
