// import { RootState } from "../store";

// export const selectProfileState = (state: RootState) => state.profile;
// export const selectCurrentUserProfile = (state: RootState) =>
//   state.profile.data;
// export const selectCurrentUser = (state: RootState) =>
//   state.profile.data?.user ?? null;
// export const selectCurrentWorkerProfile = (state: RootState) =>
//   state.profile.data?.profile ?? null;
// export const selectProfileLoading = (state: RootState) =>
//   state.profile.isLoading;
// export const selectProfileError = (state: RootState) => state.profile.error;

import { RootState } from "../store";
import { CurrentWorkerProfile, CustomerProfile } from "./profileServices";

export const selectProfileState = (state: RootState) => state.profile;

export const selectCurrentUserProfile = (state: RootState) =>
  state.profile.data;

export const selectCurrentUser = (state: RootState) =>
  state.profile.data?.user ?? null;

export const selectCurrentWorkerProfile = (
  state: RootState,
): CurrentWorkerProfile | null => {
  const currentProfile = state.profile.data;
  return currentProfile?.user.role.toUpperCase() === "WORKER"
    ? (currentProfile.profile as CurrentWorkerProfile | null)
    : null;
};

export const selectWorkerAvailabilityStatus = (state: RootState) =>
  selectCurrentWorkerProfile(state)?.availability_status ?? null;

export const selectCurrentCustomerProfile = (
  state: RootState,
): CustomerProfile | null => {
  const currentProfile = state.profile.data;
  return currentProfile?.user.role.toUpperCase() === "CUSTOMER"
    ? (currentProfile.profile as CustomerProfile | null)
    : null;
};

export const selectProfileLoading = (state: RootState) =>
  state.profile.isLoading;

export const selectProfileUpdating = (state: RootState) =>
  state.profile.isUpdating;

export const selectProfileError = (state: RootState) => state.profile.error;
