import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSavedSessionToken } from "../profile/profileServices";
import {
  Conversation,
  ConversationMessage,
  createConversation,
  getConversations,
  getConversationMessages,
  markConversationRead,
  sendConversationMessage,
} from "./conversationServices";

type ConversationThunkConfig = {
  rejectValue: string;
};

type ApiAuthState = {
  apiAuth?: {
    token?: string | null;
    user?: {
      id?: string;
    } | null;
  };
  profile?: {
    data?: {
      user?: {
        id?: string;
      } | null;
    } | null;
  };
};

const getTokenFromState = (state: unknown) =>
  (state as ApiAuthState).apiAuth?.token ?? null;

const getCurrentUserIdFromState = (state: unknown) => {
  const typedState = state as ApiAuthState;
  return typedState.profile?.data?.user?.id ?? typedState.apiAuth?.user?.id;
};

async function requireToken(getState: () => unknown): Promise<string> {
  const token = getTokenFromState(getState()) ?? (await getSavedSessionToken());

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return token;
}

export const startConversation = createAsyncThunk<
  Conversation,
  { participantId: string; jobId?: string },
  ConversationThunkConfig
>(
  "conversations/startConversation",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);
      return await createConversation(
        token,
        payload.participantId,
        payload.jobId,
        getCurrentUserIdFromState(getState()),
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to start this conversation",
      );
    }
  },
);

export const fetchConversations = createAsyncThunk<
  Conversation[],
  void,
  ConversationThunkConfig
>(
  "conversations/fetchConversations",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);
      return await getConversations(
        token,
        getCurrentUserIdFromState(getState()),
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to load your conversations",
      );
    }
  },
);

export const fetchConversationMessages = createAsyncThunk<
  ConversationMessage[],
  string,
  ConversationThunkConfig
>(
  "conversations/fetchMessages",
  async (conversationId, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);
      return await getConversationMessages(token, conversationId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to load this conversation",
      );
    }
  },
);

export const sendMessage = createAsyncThunk<
  void,
  { conversationId: string; content: string },
  ConversationThunkConfig
>(
  "conversations/sendMessage",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);
      await sendConversationMessage(
        token,
        payload.conversationId,
        payload.content,
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to send your message",
      );
    }
  },
);

export const markMessagesRead = createAsyncThunk<
  void,
  string,
  ConversationThunkConfig
>(
  "conversations/markMessagesRead",
  async (conversationId, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);
      await markConversationRead(token, conversationId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to mark the conversation as read",
      );
    }
  },
);
