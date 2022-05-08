import React from 'react';
import { User } from 'store/user';

export interface AuthContextType {
  user: User;
  login: (
    username: string,
    password: string,
    callback: VoidFunction,
  ) => Promise<LoginResponse>;
  logout: (callback: VoidFunction) => void;
  refreshAuth: (callback: VoidFunction) => Promise<boolean>;
}

export interface LoginResponse {
  message: string;
  statusCode: number;
  result: 'success' | 'failure';
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export const AuthContext = ((): React.Context<AuthContextType> => {
  return React.createContext<AuthContextType>(null!);
})();
