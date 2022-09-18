import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '..';
import messageApi from '../../api/messageApi';
import {
  ConversationMessage,
  DeleteMessageEventPayload,
  MessageEventPayload,
} from '../../utils/types';

interface InitialStateDetails {
  messages: ConversationMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialStateDetails = {
  messages: [],
  loading: false,
  error: null,
};

export const getMessagesByConversation = createAsyncThunk(
  'message/getMessagesByConversation',
  async (
    {
      requestId,
      limit,
      offset,
    }: { requestId: string; limit: number; offset: number },
    thunkApi
  ) => {
    try {
      const res = await messageApi.getMessagesByConversationId(
        requestId,
        limit,
        offset
      );
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(`Get Messages fail. ${error}`);
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<MessageEventPayload>) => {
      const { conversation, message } = action.payload;
      const conversationMessage = state.messages.find(
        (cm) => cm.id === conversation.id
      );
      conversationMessage?.messages.unshift(message);
    },
    deleteMessage: (
      state,
      action: PayloadAction<DeleteMessageEventPayload>
    ) => {
      const { conversationId, messageId } = action.payload;
      const conversationMessage = state.messages.find(
        (cm) => cm.id === conversationId
      );
      if (!conversationMessage) return;
      const messageIndex = conversationMessage.messages.findIndex(
        (m) => m.id === messageId
      );
      conversationMessage.messages.splice(messageIndex, 1);
    },
    fetchMoreMessages: (state, action: PayloadAction<ConversationMessage>) => {
      const { id, messages } = action.payload;
      const index = state.messages.findIndex((cm) => cm.id === id);
      const exists = state.messages.find((cm) => cm.id === id);
      if (exists) {
        console.log('exists');
        state.messages[index].messages.push(...messages);
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getMessagesByConversation.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getMessagesByConversation.fulfilled,
        (state, action: PayloadAction<ConversationMessage>) => {
          const { id, messages } = action.payload;
          const index = state.messages.findIndex((cm) => cm.id === id);
          const exists = state.messages.find((cm) => cm.id === id);
          if (exists) {
            state.messages[index] = action.payload;
          } else {
            state.messages.push(action.payload);
          }
          state.loading = false;
        }
      )
      .addCase(getMessagesByConversation.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

const selectConversationMessages = (state: RootState) => state.message.messages;
const selectConversationMessageId = (state: RootState, id: number) => id;

export const selectConversationMessage = createSelector(
  [selectConversationMessages, selectConversationMessageId],
  (conversationMessages, id) => conversationMessages.find((cm) => cm.id === id)
);

export const { addMessage, deleteMessage, fetchMoreMessages } =
  messageSlice.actions;

export default messageSlice.reducer;
