import React, { createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import JwtManager from '../utils/jwt';

const token = JwtManager.getToken();

const socket = io(process.env.REACT_APP_SOCKET_URL as string, {
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },

  withCredentials: true,
});
const SocketContext = createContext<Socket>(socket);

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
