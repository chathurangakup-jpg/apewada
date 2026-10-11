import { createAsyncThunk } from "@reduxjs/toolkit";
import { removeStoredAuthToken } from "../auth/authServices";
import {
  CurrentUserProfile,
  getCurrentUserProfile,
  getSavedSessionToken,
} from "./profileServices";

type ProfileThunkConfig = { rejectValue: string };
type ApiAuthState = { apiAuth?: { token?: string | null } };

const getTokenFromState = (state: unknown) =>
  (state as ApiAuthState).apiAuth?.token ?? null;

export const fetchCurrentProfile = createAsyncThunk<
  CurrentUserProfile,
  void,
  ProfileThunkConfig
>(
  "profile/fetchCurrentProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token =
        getTokenFromState(getState()) ?? (await getSavedSessionToken());
      if (!token) return rejectWithValue("Your session has expired");
      return await getCurrentUserProfile(token);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to load your profile",
      );
    }
  },
  {
    condition: async (_, { getState }) =>
      Boolean(getTokenFromState(getState()) ?? (await getSavedSessionToken())),
  },
);

export const logoutCurrentUser = createAsyncThunk<
  void,
  void,
  ProfileThunkConfig
>("profile/logoutCurrentUser", async (_, { rejectWithValue }) => {
  try {
    await removeStoredAuthToken();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to clear saved session",
    );
  }
});
