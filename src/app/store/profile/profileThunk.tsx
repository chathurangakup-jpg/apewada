import { createAsyncThunk } from "@reduxjs/toolkit";
import { removeStoredAuthToken } from "../auth/authServices";
import {
  CurrentUserProfile,
  UpdateCustomerProfilePayload,
  UpdateWorkerProfilePayload,
  WorkerAvailabilityStatus,
  getCurrentUserProfile,
  getSavedSessionToken,
  patchCustomerProfile,
  patchWorkerAvailabilityStatus,
  patchWorkerProfile,
} from "./profileServices";

type ProfileThunkConfig = {
  rejectValue: string;
};

type ApiAuthState = {
  apiAuth?: {
    token?: string | null;
  };
};

const getTokenFromState = (state: unknown) =>
  (state as ApiAuthState).apiAuth?.token ?? null;

async function requireToken(getState: () => unknown): Promise<string> {
  const token = getTokenFromState(getState()) ?? (await getSavedSessionToken());

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return token;
}

export const fetchCurrentProfile = createAsyncThunk<
  CurrentUserProfile,
  void,
  ProfileThunkConfig
>(
  "profile/fetchCurrentProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);
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

export const updateCustomerProfile = createAsyncThunk<
  CurrentUserProfile,
  UpdateCustomerProfilePayload,
  ProfileThunkConfig
>(
  "profile/updateCustomerProfile",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);

      await patchCustomerProfile(token, payload);

      // Fetch the server's latest profile after updating.
      return await getCurrentUserProfile(token);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to update customer profile",
      );
    }
  },
);

export const updateWorkerProfile = createAsyncThunk<
  CurrentUserProfile,
  UpdateWorkerProfilePayload,
  ProfileThunkConfig
>(
  "profile/updateWorkerProfile",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);

      await patchWorkerProfile(token, payload);

      // Fetch the server's latest profile after updating.
      return await getCurrentUserProfile(token);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to update worker profile",
      );
    }
  },
);

export const updateWorkerAvailabilityStatus = createAsyncThunk<
  CurrentUserProfile,
  WorkerAvailabilityStatus,
  ProfileThunkConfig
>(
  "profile/updateWorkerAvailabilityStatus",
  async (availabilityStatus, { getState, rejectWithValue }) => {
    try {
      const token = await requireToken(getState);
      console.log(
        "Updating worker availability status to:",
        availabilityStatus,
      );
      const availabilityResponse = await patchWorkerAvailabilityStatus(
        token,
        availabilityStatus,
      );
      console.log(
        "Worker availability status API response:",
        availabilityResponse,
      );

      const profileResponse = await getCurrentUserProfile(token);
      console.log("Current user profile API response:", profileResponse);
      return profileResponse;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to update worker availability",
      );
    }
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
