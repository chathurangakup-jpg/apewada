import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMyWorkerJobRequests,
  WorkerJobRequestSummary,
  editWorkerQuotation,
  submitWorkerQuotation,
  withdrawWorkerQuotation,
} from "./workerThunk";

interface WorkerState {
  isSubmittingQuotation: boolean;
  quotationError: string | null;
  submittedQuotationJobIds: string[];
  myJobRequests: WorkerJobRequestSummary[];
  isLoadingMyJobRequests: boolean;
  myJobRequestsError: string | null;
  updatingQuotationJobId: string | null;
  withdrawingQuotationJobId: string | null;
}

const initialState: WorkerState = {
  isSubmittingQuotation: false,
  quotationError: null,
  submittedQuotationJobIds: [],
  myJobRequests: [],
  isLoadingMyJobRequests: false,
  myJobRequestsError: null,
  updatingQuotationJobId: null,
  withdrawingQuotationJobId: null,
};

const workerSlice = createSlice({
  name: "worker",
  initialState,
  reducers: {
    clearWorkerQuotationError(state) {
      state.quotationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitWorkerQuotation.pending, (state) => {
        state.isSubmittingQuotation = true;
        state.quotationError = null;
      })
      .addCase(submitWorkerQuotation.fulfilled, (state, action) => {
        state.isSubmittingQuotation = false;
        if (!state.submittedQuotationJobIds.includes(action.payload.jobId)) {
          state.submittedQuotationJobIds.push(action.payload.jobId);
        }
      })
      .addCase(submitWorkerQuotation.rejected, (state, action) => {
        state.isSubmittingQuotation = false;
        state.quotationError =
          action.payload ??
          action.error.message ??
          "Unable to submit your quotation";
      })
      .addCase(editWorkerQuotation.pending, (state, action) => {
        state.updatingQuotationJobId = action.meta.arg.jobId;
        state.quotationError = null;
      })
      .addCase(editWorkerQuotation.fulfilled, (state, action) => {
        state.updatingQuotationJobId = null;
        const summary = state.myJobRequests.find(
          (item) => item.jobId === action.payload.jobId,
        );
        if (summary) {
          summary.request = {
            ...summary.request,
            ...action.payload.quotation,
          };
        }
      })
      .addCase(editWorkerQuotation.rejected, (state, action) => {
        state.updatingQuotationJobId = null;
        state.quotationError =
          action.payload ??
          action.error.message ??
          "Unable to update your quotation";
      })
      .addCase(withdrawWorkerQuotation.pending, (state, action) => {
        state.withdrawingQuotationJobId = action.meta.arg;
        state.quotationError = null;
      })
      .addCase(withdrawWorkerQuotation.fulfilled, (state, action) => {
        state.withdrawingQuotationJobId = null;
        for (const summary of state.myJobRequests) {
          if (summary.jobId === action.payload) {
            summary.request.status = "WITHDRAWN";
          }
        }
        state.submittedQuotationJobIds =
          state.submittedQuotationJobIds.filter(
            (jobId) => jobId !== action.payload,
          );
      })
      .addCase(withdrawWorkerQuotation.rejected, (state, action) => {
        state.withdrawingQuotationJobId = null;
        state.quotationError =
          action.payload ??
          action.error.message ??
          "Unable to withdraw your quotation";
      })
      .addCase(fetchMyWorkerJobRequests.pending, (state) => {
        state.isLoadingMyJobRequests = true;
        state.myJobRequestsError = null;
      })
      .addCase(fetchMyWorkerJobRequests.fulfilled, (state, action) => {
        state.isLoadingMyJobRequests = false;
        state.myJobRequests = action.payload;
      })
      .addCase(fetchMyWorkerJobRequests.rejected, (state, action) => {
        state.isLoadingMyJobRequests = false;
        state.myJobRequestsError =
          action.payload ??
          action.error.message ??
          "Unable to load your job requests";
      });
  },
});

export const { clearWorkerQuotationError } = workerSlice.actions;
export default workerSlice.reducer;
