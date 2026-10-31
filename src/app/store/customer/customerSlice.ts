import { createSlice } from "@reduxjs/toolkit";
import { CustomerJob } from "./customerServices";
import {
  editCustomerJob,
  fetchCustomerJobs,
  submitCustomerJob,
} from "./customerThunk";

interface CustomerState {
  postedJobs: CustomerJob[];
  isLoadingJobs: boolean;
  jobsError: string | null;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  postedJobs: [],
  isLoadingJobs: false,
  jobsError: null,
  isSubmitting: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerJobs.pending, (state) => {
        state.isLoadingJobs = true;
        state.jobsError = null;
      })
      .addCase(fetchCustomerJobs.fulfilled, (state, action) => {
        state.isLoadingJobs = false;
        state.postedJobs = action.payload;
      })
      .addCase(fetchCustomerJobs.rejected, (state, action) => {
        state.isLoadingJobs = false;
        state.jobsError =
          action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(submitCustomerJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitCustomerJob.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.postedJobs.unshift(action.payload);
      })
      .addCase(submitCustomerJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(editCustomerJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(editCustomerJob.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.postedJobs.findIndex(
          (job) => job.id === action.payload.id,
        );
        if (index >= 0) {
          state.postedJobs[index] = action.payload;
        } else {
          state.postedJobs.unshift(action.payload);
        }
      })
      .addCase(editCustomerJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? action.error.message ?? "Request failed";
      });
  },
});

export default customerSlice.reducer;
