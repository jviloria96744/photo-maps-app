/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Channel = {
  __typename: "Channel",
  data: string,
  name: string,
};

export type Publish2channelMutationVariables = {
  data: string,
  name: string,
};

export type Publish2channelMutation = {
  publish2channel?:  {
    __typename: "Channel",
    data: string,
    name: string,
  } | null,
};

export type GetChannelQuery = {
  getChannel?:  {
    __typename: "Channel",
    data: string,
    name: string,
  } | null,
};

export type Subscribe2channelSubscriptionVariables = {
  name: string,
};

export type Subscribe2channelSubscription = {
  subscribe2channel?:  {
    __typename: "Channel",
    data: string,
    name: string,
  } | null,
};
