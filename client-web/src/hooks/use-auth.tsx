import React, { useState, useEffect, useContext } from "react";
import { Auth, CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { AuthContext } from "../context/AuthContext";
import { postUser, deleteUser, getPhotosByUser } from "../api/base-endpoints";
import { usePhotoStore } from "../stores/photo-store";
import { User, UserResponse } from "../models/user";

export function ProvideAuth({ children }: React.PropsWithChildren) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  const { setInitialData } = usePhotoStore();

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

        setUser(user);

        /*
          Normally, I would want to move this logic somewhere else, 
          but fetching photos is so core to the application that I want it done as early as possible, 
          so this fetch happens as soon as the user is authenticated
         */
        getPhotosByUser().then((data) => {
          setInitialData(data);
        });
      })
      .catch((err) => {
        console.log("Auth error");
      });

    return () => setInitialData([]);
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
