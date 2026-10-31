import { createSlice } from "@reduxjs/toolkit";
import { logoutCurrentUser } from "../profile/profileThunk";
import { Conversation, ConversationMessage } from "./conversationServices";
import {
  fetchConversations,
  fetchConversationMessages,
  markMessagesRead,
  sendMessage,
  startConversation,
} from "./conversationThunk";

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ConversationMessage[];
  isLoadingConversations: boolean;
  isStarting: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: ConversationState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoadingConversations: false,
  isStarting: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
};

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    clearConversationError(state) {
      state.error = null;
    },
    openConversation(state, action: { payload: Conversation }) {
      state.currentConversation = action.payload;
      state.messages = [];
      state.error = null;
    },
    receiveSocketMessage(
      state,
      action: {
        payload: {
          conversationId: string;
          message: ConversationMessage;
          isIncoming: boolean;
        };
      },
    ) {
      const { conversationId, message, isIncoming } = action.payload;
      const summary = state.conversations.find(
        (conversation) => conversation.id === conversationId,
      );

      if (summary) {
        summary.lastMessage = message.content;
        summary.lastMessageAt = message.createdAt;
        summary.updatedAt = message.createdAt;
        if (isIncoming && state.currentConversation?.id !== conversationId) {
          summary.unreadCount = (summary.unreadCount ?? 0) + 1;
        }
      }

      if (state.currentConversation?.id === conversationId) {
        const alreadyReceived = state.messages.some(
          (existingMessage) => existingMessage.id === message.id,
        );
        if (!alreadyReceived) {
          state.messages.push(message);
        }
      }
    },
    updateSocketConversation(
      state,
      action: {
        payload: { conversationId: string; lastMessage: string | null };
      },
    ) {
      const summary = state.conversations.find(
        (conversation) => conversation.id === action.payload.conversationId,
      );
      if (summary) {
        summary.lastMessage = action.payload.lastMessage;
      }
    },
    addSocketConversation(state, action: { payload: Conversation }) {
      const existingIndex = state.conversations.findIndex(
        (conversation) => conversation.id === action.payload.id,
      );
      if (existingIndex >= 0) {
        state.conversations[existingIndex] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },
    setConversationSocketError(state, action: { payload: string }) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startConversation.pending, (state) => {
        state.isStarting = true;
        state.currentConversation = null;
        state.messages = [];
        state.error = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.isStarting = false;
        state.currentConversation = action.payload;
        state.messages = [];
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.isStarting = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to start this conversation";
      })
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to load your conversations";
      })
      .addCase(fetchConversationMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to load this conversation";
      })
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to send your message";
      })
      .addCase(markMessagesRead.rejected, (state, action) => {
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to mark the conversation as read";
      })
      .addCase(logoutCurrentUser.fulfilled, () => initialState);
  },
});

export const {
  addSocketConversation,
  clearConversationError,
  openConversation,
  receiveSocketMessage,
  setConversationSocketError,
  updateSocketConversation,
} = conversationSlice.actions;
export default conversationSlice.reducer;
