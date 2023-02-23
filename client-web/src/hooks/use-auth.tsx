import React, { useState, useEffect, useContext } from "react";
import { Auth, CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { AuthContext } from "../context/AuthContext";
import { postUser, deleteUser } from "../api/base-endpoints";
import { User, UserResponse } from "../models/user";

export function ProvideAuth({ children }: React.PropsWithChildren) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);

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

        // This cookie is used to authenticate against img src network calls
        document.cookie = `userId=${user.id}`;

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
      setUser(null);
    });

  const signOutAndDelete = async () => {
    deleteUser().then(() => {
      Auth.signOut().then(() => {
        setUser(null);
      });
    });
  };

  return {
    user,
    signIn,
    signOut,
    signOutAndDelete,
  };
}
