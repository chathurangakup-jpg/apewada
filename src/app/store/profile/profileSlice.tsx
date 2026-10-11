import { createSlice } from "@reduxjs/toolkit";
import { CurrentUserProfile } from "./profileServices";
import { fetchCurrentProfile, logoutCurrentUser } from "./profileThunk";

interface ProfileState {
  data: CurrentUserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchCurrentProfile.rejected, (state, action) => {
        state.isLoading = false;
        if (!action.meta.condition) {
          state.error =
            action.payload ?? action.error.message ?? "Unable to load profile";
        }
      })
      .addCase(logoutCurrentUser.fulfilled, () => initialState);
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
