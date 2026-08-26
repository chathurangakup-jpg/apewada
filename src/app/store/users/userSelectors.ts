// store/users/userSelectors.ts
import { RootState } from "../store";
import { CustomerProfile, User, WorkerProfile } from "./user.types";

export const selectUser = (state: RootState): User | null => state.auth.user;
export const selectCustomerProfile = (
  state: RootState,
): CustomerProfile | null => state.auth.customerProfile;
export const selectWorkerProfile = (state: RootState): WorkerProfile | null =>
  state.auth.workerProfile;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState): boolean =>
  state.auth.isLoading;
export const selectAuthError = (state: RootState): string | null =>
  state.auth.error;
export const selectAuthToken = (state: RootState): string | null =>
  state.auth.token;
export const selectUserRole = (state: RootState): string | null =>
  state.auth.user?.role || null;

export const selectIsWorker = (state: RootState): boolean =>
  state.auth.user?.role === "worker";
export const selectIsCustomer = (state: RootState): boolean =>
  state.auth.user?.role === "customer";

export const selectUserProfile = (
  state: RootState,
): CustomerProfile | WorkerProfile | null => {
  const user = state.auth.user;
  if (!user) return null;

  if (user.role === "customer") {
    return state.auth.customerProfile;
  } else if (user.role === "worker") {
    return state.auth.workerProfile;
  }
  return null;
};

export const selectWorkerStats = (state: RootState) => {
  const profile = state.auth.workerProfile;
  if (!profile) return null;

  return {
    totalJobs: profile.totalJobs || 0,
    rating: profile.rating || 0,
    verified: profile.verified || false,
    experience: profile.experience || 0,
    servicesCount: profile.services?.length || 0,
  };
};

export const selectCustomerStats = (state: RootState) => {
  const profile = state.auth.customerProfile;
  if (!profile) return null;

  return {
    totalJobsPosted: profile.totalJobsPosted || 0,
    totalSpent: profile.totalSpent || 0,
    averageRating: profile.averageRating || 0,
    savedWorkers: profile.savedWorkers?.length || 0,
    savedJobs: profile.savedJobs?.length || 0,
  };
};

export const selectUserAvatar = (state: RootState): string | undefined =>
  state.auth.user?.avatar;

export const selectUserName = (state: RootState): string =>
  state.auth.user?.name || "User";

export const selectUserEmail = (state: RootState): string =>
  state.auth.user?.email || "";

export const selectUserPhone = (state: RootState): string | undefined =>
  state.auth.user?.phone;

export const selectIsUserVerified = (state: RootState): boolean =>
  state.auth.user?.isVerified || false;

export const selectUserLocation = (state: RootState) => {
  const user = state.auth.user;
  if (!user) return null;

  if (user.role === "worker" && state.auth.workerProfile) {
    return state.auth.workerProfile.location;
  }

  if (user.role === "customer" && state.auth.customerProfile?.address) {
    return state.auth.customerProfile.address;
  }

  return null;
};
