// store/jobs/jobSelectors.ts
import { RootState } from "../store";
import { Job } from "./job.types";

export const selectAllJobs = (state: RootState) => {
  const result = state.jobApi.queries["getJobs"]?.data;
  return result ? (result as any).jobs : [];
};

export const selectRecentJobs = (state: RootState) => {
  const result = state.jobApi.queries["getRecentJobs"]?.data;
  return (result as Job[]) || [];
};

export const selectJobById = (state: RootState, jobId: string) => {
  const result = state.jobApi.queries[`getJobById("${jobId}")`]?.data;
  return (result as Job) || null;
};

export const selectIsLoadingJobs = (state: RootState) => {
  return state.jobApi.queries["getJobs"]?.status === "pending";
};

export const selectIsLoadingRecentJobs = (state: RootState) => {
  return state.jobApi.queries["getRecentJobs"]?.status === "pending";
};

export const selectJobsError = (state: RootState) => {
  return state.jobApi.queries["getJobs"]?.error as Error | null;
};
