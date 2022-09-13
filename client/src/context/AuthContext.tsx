import React, { createContext, useContext, useState } from 'react';
import { Friendship, User } from '../utils/types';
import JWTManager from '../utils/jwt';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

interface IAuthContext {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  checkAuth: () => Promise<void>;
  logoutClient: () => void;
}

const defaultIsAuthenticated = false;

export const AuthContext = createContext<IAuthContext>({
  user: {} as User,
  setUser: () => {},
  checkAuth: () => Promise.resolve(),
  logoutClient: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({} as User);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const token = JWTManager.getToken();
    if (token) {
      const res = await authApi.me();
      if (res.data) setUser(res.data);
    } else {
      const success = await JWTManager.getRefreshToken();
      if (success) {
        const res = await authApi.me();
        if (res.data) setUser(res.data);
        else navigate('/login');
      } else navigate('/login');
    }
  };

  const logoutClient = () => {
    JWTManager.deleteToken();
    JWTManager.deleteRefreshToken();
    setUser({} as User);
  };

  const authContextData: IAuthContext = {
    user,
    setUser,
    checkAuth,
    logoutClient,
  };

  return (
    <AuthContext.Provider value={authContextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
