import {
  LoginInput,
  RegisterInput,
  Tokens,
  UpdateUserInput,
  User,
} from '../utils/types';
import axiosClient from './axiosClient';

const userApi = {
  getAllUsers: () => axiosClient.get<User[]>('users'),
  updateUser: (params: UpdateUserInput) =>
    axiosClient.patch<{ message: string }>('users', {
      [params.field]: params.value,
    }),
};

export default userApi;
