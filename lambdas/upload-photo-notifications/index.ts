import { Handler } from "aws-lambda";
import { API, Amplify } from "aws-amplify";
import * as mutations from "./graphql/mutations";
import { getAmplifyConfiguration } from "./utils/amplify-configuration";
import { Event, eventParser } from "./utils/event-parser";

export const handler: Handler = async (event: Event, context) => {
  const { channel, data } = eventParser(event);

  try {
    await handleEvent(channel, data);
  } catch (error) {
    return error;
  }
};

const handleEvent = async (channel: string, data: string) => {
  const amplifyConfiguration = await getAmplifyConfiguration();
  Amplify.configure(amplifyConfiguration);

  const publish = await API.graphql({
    query: mutations.publish2channel,
    variables: { name: channel, data },
    authMode: "API_KEY",
  });
};

// try {
//   handleEvent(
//     "channel-USER_ce6d924c-99c4-46d7-bc45-c88a7f2a8de9",
//     JSON.stringify({ Test: "ts-node" })
//   );
// } catch {
//   console.log("Catch");
// }
