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
export const selectWorkerById = (state: RootState, workerId: string) =>
  state.home.workersById[workerId] ?? null;
export const selectWorkerDetailsLoading = (
  state: RootState,
  workerId: string,
) => state.home.workerDetailsLoading[workerId] ?? false;
export const selectWorkerDetailsError = (state: RootState, workerId: string) =>
  state.home.workerDetailsError[workerId] ?? null;
export const selectJobById = (state: RootState, jobId: string) =>
  state.home.jobsById[jobId] ?? null;
export const selectJobDetailsLoading = (state: RootState, jobId: string) =>
  state.home.jobDetailsLoading[jobId] ?? false;
export const selectJobDetailsError = (state: RootState, jobId: string) =>
  state.home.jobDetailsError[jobId] ?? null;
