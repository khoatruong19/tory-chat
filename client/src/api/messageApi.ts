import {
  ConversationMessage,
  CreateMessageParams,
  DeleteMessageParams,
  Friendship,
  Message,
  MessageEventPayload,
} from '../utils/types';
import axiosClient from './axiosClient';

const messageApi = {
  getMessagesByConversationId: (
    requestId: string,
    limit: number,
    offset: number
  ) =>
    axiosClient.get<ConversationMessage>(
      `conversations/${requestId}/messages?limit=${limit}&offset=${offset}`
    ),
  createMessage: ({ requestId, content, seen }: CreateMessageParams) =>
    axiosClient.post<MessageEventPayload>(
      `conversations/${requestId}/messages`,
      {
        content,
        seen,
      }
    ),
  deleteMessage: ({ requestId, messageId }: DeleteMessageParams) =>
    axiosClient.delete<{ message: string }>(
      `conversations/${requestId}/messages/${messageId}`
    ),
  updateUnseenMessages: (requestId: number) =>
    axiosClient.patch<{ message: string }>(
      `conversations/${requestId}/messages`
    ),
};

export default messageApi;
