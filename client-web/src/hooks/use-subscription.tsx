import { useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { GraphQLSubscription, GraphQLResult } from "@aws-amplify/api";
import {
  subscribe2channel,
  Subscribe2channelSubscription,
  publish2channel,
} from "../graphql";
import { User } from "../models/user";

export type CallbackFunctionType = (
  value: GraphQLResult<GraphQLSubscription<Subscribe2channelSubscription>>
) => void;

interface UseSubscriptionProps {
  channel: string;
  callback_function: CallbackFunctionType;
  user: User | undefined;
}

type msgType = {
  [key: string]: any;
};

export const useSubscription = (props: UseSubscriptionProps) => {
  const { channel, callback_function, user } = props;

  useEffect(() => {
    if (!user) {
      return;
    }

    const subscription = API.graphql<
      GraphQLSubscription<Subscribe2channelSubscription>
    >(
      graphqlOperation(subscribe2channel, { name: `${channel}-${user.id}` })
    ).subscribe({
      next: ({ provider, value }) => {
        // Structure of
        // value?.data?.subscribe2channel?.data
        callback_function(value);
      },
      error: (error) => console.warn(error),
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const publishMessage = (channel: string, msg: msgType) => {
    API.graphql(
      graphqlOperation(publish2channel, {
        name: channel,
        data: JSON.stringify(msg),
      })
    );
  };

  return {
    channel,
    publishMessage,
  };
};
