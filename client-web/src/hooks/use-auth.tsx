import React, { useState, useEffect, useContext } from "react";
import { Auth, CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { AuthContext } from "../context/AuthContext";
import { postUser, deleteUser } from "../api/base-endpoints";
import { User, UserResponse } from "../models/user";
import { ENV } from "../config";

export function ProvideAuth({ children }: React.PropsWithChildren) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (user) {
      return;
    }

    Auth.currentAuthenticatedUser()
      .then(async () => {
        const userData: UserResponse = await postUser();

        const user: User = {
          username: userData.username,
          id: userData.pk,
          lastLoginDate: userData.datetime_updated,
          userCreatedDate: userData.datetime_created,
        };

        setIsSignedIn(true);
        setUser(user);
      })
      .catch((err) => {
        console.log("Auth error");
      });
  }, [user]);

  const signIn = async () => {
    await Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Google,
    });
  };

  const signOut = () =>
    Auth.signOut().then(() => {
      setIsSignedIn(false);
      setUser(null);
    });

  const signOutAndDelete = async () => {
    deleteUser().then(() => {
      Auth.signOut().then(() => {
        setIsSignedIn(false);
        setUser(null);
      });
    });
  };

  return {
    user,
    isSignedIn,
    signIn,
    signOut,
    signOutAndDelete,
  };
}

export const amplifyConfigurationOptions = {
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: ENV.VITE_AWS_REGION,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: ENV.VITE_USERPOOL_ID,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: ENV.VITE_USERPOOL_WEB_CLIENT_ID,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: `${ENV.VITE_COGNITO_DOMAIN}.auth.${ENV.VITE_AWS_REGION}.amazoncognito.com`,
      scope: ["email", "profile", "openid"],
      redirectSignIn: `${window.location.origin}/`,
      redirectSignOut: `${window.location.origin}/`,
      responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
    },
  },
};
