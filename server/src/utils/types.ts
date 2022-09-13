import { Friendship, Message, User } from 'src/typeorm';

//*****USER*****//
export type CreateUserDetails = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type UpdateUserDetails = Partial<CreateUserDetails> & {
  image?: string;
  userId: number;
};

//*****JWT*****//
export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  sub: number;
  email: string;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };

export type FriendshipStatus = 0 | 1;

export type sendRequestDetails = {
  senderId: number;
  receiver: string;
  receiverImage: string;
  receiverId: number;
};

export type CreateMessageParams = {
  userId: number;
  content: string;
  seen: boolean;
  requestId: number;
};

export type CreateMessageResponse = {
  message: Message;
  conversation: Friendship;
};

export type DeleteMessageParams = {
  userId: number;
  conversationId: number;
  messageId: number;
};

export type DeleteMessageEventPayload = {
  socketReceiverUserId: number;
  conversationId: number;
  messageId: number;
};

export type UpdateMessagesSeenParams = {
  userId: number;
  conversationId: number;
};
