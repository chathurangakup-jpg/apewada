import { RootState } from "../store";

export const selectHomeState = (state: RootState) => state.home;
export const selectHomeCategories = (state: RootState) => state.home.categories;
export const selectTopRatedWorkers = (state: RootState) =>
  state.home.topRatedWorkers;
export const selectRecentJobs = (state: RootState) => state.home.recentJobs;
export const selectHomeLoading = (state: RootState) => state.home.isLoading;
export const selectHomeError = (state: RootState) => state.home.error;
