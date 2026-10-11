import { createSlice } from "@reduxjs/toolkit";
import { HomeData } from "./homeServices";
import { fetchHomeData } from "./homeThunk";

interface HomeState extends HomeData {
  isLoading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  categories: [],
  topRatedWorkers: [],
  recentJobs: [],
  isLoading: false,
  error: null,
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
      });
  },
});

export default homeSlice.reducer;
