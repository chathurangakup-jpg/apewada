import { RootState } from "../store";

export const selectProfileState = (state: RootState) => state.profile;
export const selectCurrentUserProfile = (state: RootState) =>
  state.profile.data;
export const selectCurrentUser = (state: RootState) =>
  state.profile.data?.user ?? null;
export const selectCurrentWorkerProfile = (state: RootState) =>
  state.profile.data?.profile ?? null;
export const selectProfileLoading = (state: RootState) =>
  state.profile.isLoading;
export const selectProfileError = (state: RootState) => state.profile.error;
