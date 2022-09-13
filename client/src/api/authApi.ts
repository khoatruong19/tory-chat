import { LoginInput, RegisterInput, Tokens, User } from '../utils/types';
import axiosClient from './axiosClient';

const authApi = {
  register: (params: RegisterInput) =>
    axiosClient.post<User>('auth/register', params),
  login: (params: LoginInput) =>
    axiosClient.post<{ user: User; tokens: Tokens }>('auth/login', params),
  me: () => axiosClient.post<User>('auth/me'),
  logout: () => axiosClient.post<User>('auth/logout'),
};

export default authApi;
