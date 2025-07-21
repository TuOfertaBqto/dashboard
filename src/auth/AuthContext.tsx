import { createContext } from "react";

export type User = {
  id: string;
  role: string;
  email: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
