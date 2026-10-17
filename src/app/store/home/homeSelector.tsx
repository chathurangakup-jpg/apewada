import { RootState } from "../store";

export const selectHomeState = (state: RootState) => state.home;
export const selectHomeCategories = (state: RootState) => state.home.categories;
export const selectTopRatedWorkers = (state: RootState) =>
  state.home.topRatedWorkers;
export const selectRecentJobs = (state: RootState) => state.home.recentJobs;
export const selectHomeLoading = (state: RootState) => state.home.isLoading;
export const selectHomeError = (state: RootState) => state.home.error;
export const selectAllWorkers = (state: RootState) => state.home.allWorkers;
export const selectAllWorkersLoading = (state: RootState) =>
  state.home.isLoadingAllWorkers;
export const selectAllWorkersError = (state: RootState) =>
  state.home.allWorkersError;
export const selectAllJobs = (state: RootState) => state.home.allJobs;
export const selectAllJobsLoading = (state: RootState) =>
  state.home.isLoadingAllJobs;
export const selectAllJobsError = (state: RootState) => state.home.allJobsError;
