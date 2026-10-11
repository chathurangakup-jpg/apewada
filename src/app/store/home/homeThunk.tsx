import { createAsyncThunk } from "@reduxjs/toolkit";
import { getHomeData, HomeData } from "./homeServices";

export const fetchHomeData = createAsyncThunk<
  HomeData,
  void,
  { rejectValue: string }
>("user/getData", async (_, { rejectWithValue }) => {
  try {
    return await getHomeData();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load home data",
    );
  }
});
