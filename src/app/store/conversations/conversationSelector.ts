import { RootState } from "../store";

export const selectConversationState = (state: RootState) =>
  state.conversations;

export const selectCurrentConversation = (state: RootState) =>
  state.conversations.currentConversation;

export const selectConversations = (state: RootState) =>
  state.conversations.conversations;

export const selectConversationsLoading = (state: RootState) =>
  state.conversations.isLoadingConversations;

export const selectConversationMessages = (state: RootState) =>
  state.conversations.messages;

export const selectConversationStarting = (state: RootState) =>
  state.conversations.isStarting;

export const selectConversationMessagesLoading = (state: RootState) =>
  state.conversations.isLoadingMessages;

export const selectConversationSending = (state: RootState) =>
  state.conversations.isSending;

export const selectConversationError = (state: RootState) =>
  state.conversations.error;
