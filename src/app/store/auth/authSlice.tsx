import { createSlice } from "@reduxjs/toolkit";
import { AuthUser } from "./authServices";
import { loginUser, registerUser } from "./authThunk";

interface ApiAuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  registrationMessage: string | null;
}

const initialState: ApiAuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  registrationMessage: null,
};

const authSlice = createSlice({
  name: "apiAuth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearApiAuth(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.registrationMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? "Login failed";
      });
  },
});

export const { clearAuthError, clearApiAuth } = authSlice.actions;
export default authSlice.reducer;
