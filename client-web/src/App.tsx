import { useEffect, useState } from "react";
import MapView from "./components/map/MapView";
import UserMenu from "./components/UserMenu";
import UploadPhotoIconButton from "./components/UploadPhotoButton";
import PhotoContainerModal from "./components/photos/PhotoContainerModal";
import { useAuth } from "./hooks/use-auth";
import { API, graphqlOperation } from "aws-amplify";
import {
  subscribe2channel,
  Subscribe2channelSubscription,
  publish2channel,
} from "./graphql";
import { GraphQLSubscription } from "@aws-amplify/api";

function App() {
  const { isSignedIn } = useAuth();

  const [received, setReceived] = useState("");

  //Define the channel name here
  let channel = "robots";
  let data = "";

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    const subscription = API.graphql<
      GraphQLSubscription<Subscribe2channelSubscription>
    >(graphqlOperation(subscribe2channel, { name: channel })).subscribe({
      next: ({ provider, value }) => {
        setReceived(value?.data?.subscribe2channel?.data || "");
      },
      error: (error) => console.warn(error),
    });

    setTimeout(() => {
      API.graphql(
        graphqlOperation(publish2channel, {
          name: channel,
          data: JSON.stringify({ Ping: "Pong" }),
        })
      );
    }, 2500);

    return () => subscription.unsubscribe();
  }, [isSignedIn]);

  if (received) {
    data = JSON.parse(received);
    console.log(data);
  }

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
