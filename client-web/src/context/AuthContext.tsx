import { createContext } from "react";
import { User } from "../models/user";

interface IAuthContext {
  user: User | null;
  isSignedIn?: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<IAuthContext>({
  user: null,
  isSignedIn: false,
  signIn: async () => {},
  signOut: async () => {},
});
