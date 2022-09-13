import {
  Friendship,
  SendRequestInput,
  Tokens,
  User,
  UserWithRequestId,
} from '../utils/types';
import axiosClient from './axiosClient';

const friendApi = {
  getFriends: () => axiosClient.get<UserWithRequestId[]>('friends'),
  getAllRequests: () => axiosClient.get<Friendship[]>('friends/requests'),
  sendRequest: (params: SendRequestInput) =>
    axiosClient.post<Friendship>('friends', params),
  acceptRequest: (id: number) =>
    axiosClient.patch<{ message: string }>(`friends/${id}`),
  cancelRequest: (id: number) =>
    axiosClient.delete<{ message: string }>(`friends/${id}`),
  unfriend: (id: number) =>
    axiosClient.delete<{ message: string }>(`friends/unfriend/${id}`),
};

export default friendApi;
