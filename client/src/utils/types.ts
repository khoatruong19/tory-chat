export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  description: string;
};

export type UserWithRequestId = User & {
  requestId: number;
  lastMessage?: Message;
  unseenMessagesCount: number;
};

export type UpdateUserInput = {
  field: keyof Omit<User, 'id'>;
  value: string;
};

//auth
export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

//friendship
export type Friendship = {
  id: number;
  sender: string;
  senderImage: string;
  senderId: number;
  receiver: string;
  receiverImage: string;
  receiverId: number;
};

export type SendRequestInput = {
  receiver: string;
  receiverImage: string;
  receiverId: number;
};

//message
export type Message = {
  id: number;
  content: string;
  createdAt: string;
  author: User;
  conversation: Friendship;
  seen: boolean;
};

export type ConversationMessage = {
  id: number;
  messages: Message[];
};

export type CreateMessageParams = {
  requestId: number;
  content: string;
  seen: boolean;
};

export type DeleteMessageParams = {
  requestId: number;
  messageId: number;
};

export type FetchMessagesPayload = {
  requestId: number;
  messages: Message[];
};

export type MessageEventPayload = {
  message: Message;
  conversation: Friendship & { lastMessageSent: Message };
};

export type DeleteMessageEventPayload = {
  conversationId: number;
  messageId: number;
};
