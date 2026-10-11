import { RootState } from "../store";

export const selectApiAuthState = (state: RootState) => state.apiAuth;
export const selectApiAuthUser = (state: RootState) => state.apiAuth.user;
export const selectApiAuthToken = (state: RootState) => state.apiAuth.token;
export const selectApiAuthLoading = (state: RootState) =>
  state.apiAuth.isLoading;
export const selectApiAuthError = (state: RootState) => state.apiAuth.error;
