import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSavedSessionToken } from "../profile/profileServices";
import {
  getAllJobs,
  getAllWorkers,
  getHomeData,
  getJobById,
  getWorkerById,
  HomeData,
  HomeJob,
  HomeWorker,
} from "./homeServices";

type ApiAuthState = {
  apiAuth?: {
    token?: string | null;
  };
};

const getTokenFromState = (state: unknown) =>
  (state as ApiAuthState).apiAuth?.token ?? null;

async function requireToken(getState: () => unknown): Promise<string> {
  const token = getTokenFromState(getState()) ?? (await getSavedSessionToken());

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return token;
}

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

export const fetchAllWorkers = createAsyncThunk<
  HomeWorker[],
  void,
  { rejectValue: string }
>("home/fetchAllWorkers", async (_, { getState, rejectWithValue }) => {
  try {
    const token = await requireToken(getState);
    return await getAllWorkers(token);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load workers",
    );
  }
});

export const fetchAllJobs = createAsyncThunk<
  HomeJob[],
  void,
  { rejectValue: string }
>("home/fetchAllJobs", async (_, { getState, rejectWithValue }) => {
  try {
    const token = await requireToken(getState);
    return await getAllJobs(token);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load jobs",
    );
  }
});

export const fetchWorkerById = createAsyncThunk<
  { id: string; worker: HomeWorker },
  string,
  { rejectValue: string }
>("home/fetchWorkerById", async (workerId, { getState, rejectWithValue }) => {
  try {
    const token = await requireToken(getState);
    const worker = await getWorkerById(token, workerId);
    return { id: workerId, worker };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load worker details",
    );
  }
});

export const fetchJobById = createAsyncThunk<
  { id: string; job: HomeJob },
  string,
  { rejectValue: string }
>("home/fetchJobById", async (jobId, { getState, rejectWithValue }) => {
  try {
    const token = await requireToken(getState);
    const job = await getJobById(token, jobId);
    return { id: jobId, job };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load job details",
    );
  }
});
