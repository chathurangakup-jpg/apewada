import { RootState } from "../store";

export const selectCustomerPostedJobs = (state: RootState) =>
  state.customer.postedJobs;
export const selectCustomerJobById = (state: RootState, jobId?: string) =>
  jobId
    ? state.customer.postedJobs.find((job) => job.id === jobId) ?? null
    : null;
export const selectCustomerJobSubmitting = (state: RootState) =>
  state.customer.isSubmitting;
export const selectCustomerJobError = (state: RootState) => state.customer.error;
export const selectCustomerJobsLoading = (state: RootState) =>
  state.customer.isLoadingJobs;
export const selectCustomerJobsError = (state: RootState) =>
  state.customer.jobsError;
