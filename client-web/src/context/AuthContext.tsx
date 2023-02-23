import { createContext } from "react";
import { User } from "../models/user";

interface IAuthContext {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signOutAndDelete: () => Promise<void>;
}

export const AuthContext = createContext<IAuthContext>({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  signOutAndDelete: async () => {},
});
