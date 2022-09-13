import axios from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { Tokens } from './types';

export const LOGOUT_EVENT = 'jwt-logout';

const JWTManager = () => {
  let inMemoryToken: string | null = null;
  let refreshTokenTimeoutId: number | null = null;
  let userId: string | null = null;

  const getUserId = () => userId;

  const getToken = () => inMemoryToken;

  const setToken = (accessToken: string) => {
    inMemoryToken = accessToken;

    const decoded = jwtDecode<JwtPayload & { sub: number; email: string }>(
      accessToken
    );
    userId = decoded.sub;
    setRefreshTokenTimeout(Number(decoded.exp) - Number(decoded.iat));

    return true;
  };

  const abortRefreshToken = () => {
    if (refreshTokenTimeoutId) window.clearTimeout(refreshTokenTimeoutId);
  };

  const deleteToken = () => {
    inMemoryToken = null;
    abortRefreshToken();
    window.localStorage.setItem(LOGOUT_EVENT, Date.now().toString());
    return true;
  };

  //Logout all tabs

  const setTokenToNull = () => (inMemoryToken = null);

  const setRefreshToken = (token: string) =>
    localStorage.setItem('rt-jwt', token);

  const getRefreshToken = async () => {
    if (localStorage.getItem('rt-jwt')) {
      try {
        const res = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('rt-jwt')}`,
          },
        }).then((res) => res.json());

        if (res) {
          setToken(res.access_token);
          setRefreshToken(res.refresh_token);
          return true;
        } else return false;
      } catch (error) {
        console.log('Unauthenticated, ', error);
        deleteToken();
        return false;
      }
    }
    return false;
  };

  const deleteRefreshToken = () => {
    window.localStorage.removeItem('rt-jwt');
    return true;
  };

  const setRefreshTokenTimeout = (delay: number) => {
    refreshTokenTimeoutId = window.setTimeout(
      getRefreshToken,
      delay * 1000 - 5000
    );
  };

  return {
    getToken,
    setToken,
    setRefreshToken,
    getRefreshToken,
    deleteRefreshToken,
    deleteToken,
    getUserId,
    setTokenToNull,
  };
};

export default JWTManager();
