import { createSlice } from "@reduxjs/toolkit";
import { HomeData, HomeJob, HomeWorker } from "./homeServices";
import {
  fetchAllJobs,
  fetchAllWorkers,
  fetchHomeData,
  fetchJobById,
  fetchWorkerById,
} from "./homeThunk";

interface HomeState extends HomeData {
  allWorkers: HomeWorker[];
  allJobs: HomeJob[];
  workersById: Record<string, HomeWorker | undefined>;
  jobsById: Record<string, HomeJob | undefined>;
  workerDetailsLoading: Record<string, boolean | undefined>;
  jobDetailsLoading: Record<string, boolean | undefined>;
  workerDetailsError: Record<string, string | undefined>;
  jobDetailsError: Record<string, string | undefined>;
  isLoading: boolean;
  isLoadingAllWorkers: boolean;
  isLoadingAllJobs: boolean;
  error: string | null;
  allWorkersError: string | null;
  allJobsError: string | null;
}

const initialState: HomeState = {
  categories: [],
  topRatedWorkers: [],
  recentJobs: [],
  allWorkers: [],
  allJobs: [],
  workersById: {},
  jobsById: {},
  workerDetailsLoading: {},
  jobDetailsLoading: {},
  workerDetailsError: {},
  jobDetailsError: {},
  isLoading: false,
  isLoadingAllWorkers: false,
  isLoadingAllJobs: false,
  error: null,
  allWorkersError: null,
  allJobsError: null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.categories;
        state.topRatedWorkers = action.payload.topRatedWorkers;
        state.recentJobs = action.payload.recentJobs;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(fetchAllWorkers.pending, (state) => {
        state.isLoadingAllWorkers = true;
        state.allWorkersError = null;
      })
      .addCase(fetchAllWorkers.fulfilled, (state, action) => {
        state.isLoadingAllWorkers = false;
        state.allWorkers = action.payload;
      })
      .addCase(fetchAllWorkers.rejected, (state, action) => {
        state.isLoadingAllWorkers = false;
        state.allWorkersError =
          action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(fetchAllJobs.pending, (state) => {
        state.isLoadingAllJobs = true;
        state.allJobsError = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.isLoadingAllJobs = false;
        state.allJobs = action.payload;
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.isLoadingAllJobs = false;
        state.allJobsError =
          action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(fetchWorkerById.pending, (state, action) => {
        state.workerDetailsLoading[action.meta.arg] = true;
        delete state.workerDetailsError[action.meta.arg];
      })
      .addCase(fetchWorkerById.fulfilled, (state, action) => {
        state.workerDetailsLoading[action.payload.id] = false;
        state.workersById[action.payload.id] = action.payload.worker;
      })
      .addCase(fetchWorkerById.rejected, (state, action) => {
        state.workerDetailsLoading[action.meta.arg] = false;
        state.workerDetailsError[action.meta.arg] =
          action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(fetchJobById.pending, (state, action) => {
        state.jobDetailsLoading[action.meta.arg] = true;
        delete state.jobDetailsError[action.meta.arg];
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.jobDetailsLoading[action.payload.id] = false;
        state.jobsById[action.payload.id] = action.payload.job;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.jobDetailsLoading[action.meta.arg] = false;
        state.jobDetailsError[action.meta.arg] =
          action.payload ?? action.error.message ?? "Request failed";
      });
  },
});

export default homeSlice.reducer;
