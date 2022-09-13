import { Friendship } from './types';

export const isInSentRequests = (
  meId: number,
  userId: number,
  sentRequests: Friendship[]
) => {
  return sentRequests.find(
    (request) => request.receiverId === userId && request.senderId === meId
  );
};

export const isInFriendRequests = (
  meId: number,
  userId: number,
  friendRequests: Friendship[]
) => {
  return friendRequests.find(
    (request) => request.senderId === userId && request.receiverId === meId
  );
};
