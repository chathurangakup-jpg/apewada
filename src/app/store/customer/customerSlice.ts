import { createSlice } from "@reduxjs/toolkit";
import { CustomerJob } from "./customerServices";
import { editCustomerJob, submitCustomerJob } from "./customerThunk";

interface CustomerState {
  postedJobs: CustomerJob[];
  isSubmitting: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  postedJobs: [],
  isSubmitting: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
