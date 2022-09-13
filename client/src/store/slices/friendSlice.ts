import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '..';
import friendApi from '../../api/friendApi';
import {
  Friendship,
  MessageEventPayload,
  UserWithRequestId,
} from '../../utils/types';

interface InitialStateDetails {
  friends: UserWithRequestId[];
  sentRequests: Friendship[];
  friendRequests: Friendship[];
  onlineIds: number[];
  error: string | null;
}

const initialState: InitialStateDetails = {
  friends: [],
  sentRequests: [],
  friendRequests: [],
  onlineIds: [],
  error: null,
};

export const getFriends = createAsyncThunk(
  'friend/getFriends',
  async (_, thunkApi) => {
    try {
      const res = await friendApi.getFriends();
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(`Get Friends fail. ${error}`);
    }
  }
);

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {
    setSentRequests(state, action: PayloadAction<Friendship[]>) {
      state.sentRequests = action.payload;
    },
    setFriendRequests(state, action: PayloadAction<Friendship[]>) {
      state.friendRequests = action.payload;
    },
    addFriendRequest(state, action: PayloadAction<Friendship>) {
      state.friendRequests = [...state.friendRequests, action.payload];
    },
    setOnlineIds(state, action: PayloadAction<number[]>) {
      state.onlineIds = action.payload;
    },
    addOnlineIds(state, action: PayloadAction<number>) {
      if (!state.onlineIds.find((id) => id === action.payload)) {
        state.onlineIds.push(action.payload);
      }
    },
    removeFriend(state, action: PayloadAction<number>) {
      return {
        ...state,
        friends: [...state.friends].filter(
          (friend) => friend.requestId !== action.payload
        ),
      };
    },
    removeRequest(
      state,
      {
        payload: { requestId, type },
      }: PayloadAction<{ requestId: number; type: 'sender' | 'receiver' }>
    ) {
      if (type === 'sender') {
        return {
          ...state,
          sentRequests: [...state.sentRequests].filter(
            (request) => request.id !== requestId
          ),
        };
      } else {
        return {
          ...state,
          friendRequests: [...state.friendRequests].filter(
            (request) => request.id !== requestId
          ),
        };
      }
    },
    updateConversation(
      state,
      action: PayloadAction<MessageEventPayload['conversation']>
    ) {
      let conversation = state.friends.find(
        (c) => c.requestId === action.payload.id
      );

      if (conversation) {
        let conversationIndex = state.friends.findIndex(
          (c) => c.requestId === action.payload.id
        );
        conversation = {
          ...conversation,
          lastMessage: action.payload.lastMessageSent,
        };
        state.friends.splice(conversationIndex, 1);
        state.friends.unshift(conversation);
      }
    },
    readAllMessage(state, action: PayloadAction<number>) {
      let conversation = state.friends.find(
        (c) => c.requestId === action.payload
      );
      if (conversation && conversation.unseenMessagesCount > 0) {
        let conversationIndex = state.friends.findIndex(
          (c) => c.requestId === action.payload
        );
        state.friends[conversationIndex].unseenMessagesCount = 0;
      }
    },
    increaseUnseenMessagesCount(state, action: PayloadAction<number>) {
      let conversation = state.friends.find(
        (c) => c.requestId === action.payload
      );
      if (conversation) {
        let conversationIndex = state.friends.findIndex(
          (c) => c.requestId === action.payload
        );
        state.friends[conversationIndex].unseenMessagesCount++;
        console.log(state.friends[conversationIndex].unseenMessagesCount);
      }
    },
  },

  extraReducers(builder) {
    builder
      .addCase(
        getFriends.fulfilled,
        (state, action: PayloadAction<UserWithRequestId[]>) => {
          state.friends = action.payload;
        }
      )
      .addCase(getFriends.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

const selectFriend = (state: RootState) => state.friend.friends;
const selectRequestId = (state: RootState, id: number) => id;

export const selectFriendInfo = createSelector(
  [selectFriend, selectRequestId],
  (friendInfos, id) => friendInfos.find((f) => f.requestId === id)
);

export const {
  setFriendRequests,
  setSentRequests,
  addFriendRequest,
  removeRequest,
  removeFriend,
  updateConversation,
  setOnlineIds,
  addOnlineIds,
  readAllMessage,
  increaseUnseenMessagesCount,
} = friendSlice.actions;

export default friendSlice.reducer;
