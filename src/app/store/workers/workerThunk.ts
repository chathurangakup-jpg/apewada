import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSavedSessionToken } from "../profile/profileServices";
import { getAllJobs } from "../home/homeServices";
import {
  editWorkerQuotation as editWorkerQuotationRequest,
  getWorkerJobRequests,
  submitWorkerQuotation as submitWorkerQuotationRequest,
  withdrawWorkerQuotation as withdrawWorkerQuotationRequest,
  WorkerJobRequest,
  WorkerQuotationPayload,
} from "./workerServices";

type WorkerAuthState = {
  apiAuth?: {
    token?: string | null;
  };
};

export interface SubmitWorkerQuotationArgs {
  jobId: string;
  quotation: WorkerQuotationPayload;
}

export interface WorkerJobRequestSummary {
  jobId: string;
  jobTitle: string;
  jobStatus?: string;
  request: WorkerJobRequest;
}

async function getWorkerToken(getState: () => unknown) {
  const token =
    (getState() as WorkerAuthState).apiAuth?.token ??
    (await getSavedSessionToken());
  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }
  return token;
}

export const submitWorkerQuotation = createAsyncThunk<
  SubmitWorkerQuotationArgs,
  SubmitWorkerQuotationArgs,
  { rejectValue: string }
>(
  "worker/submitQuotation",
  async ({ jobId, quotation }, { getState, rejectWithValue }) => {
    try {
      await submitWorkerQuotationRequest(
        await getWorkerToken(getState),
        jobId,
        quotation,
      );
      return { jobId, quotation };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to submit your quotation",
      );
    }
  },
);

export const editWorkerQuotation = createAsyncThunk<
  SubmitWorkerQuotationArgs,
  SubmitWorkerQuotationArgs,
  { rejectValue: string }
>(
  "worker/editQuotation",
  async ({ jobId, quotation }, { getState, rejectWithValue }) => {
    try {
      await editWorkerQuotationRequest(
        await getWorkerToken(getState),
        jobId,
        quotation,
      );
      return { jobId, quotation };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to update your quotation",
      );
    }
  },
);

export const withdrawWorkerQuotation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "worker/withdrawQuotation",
  async (jobId, { getState, rejectWithValue }) => {
    try {
      await withdrawWorkerQuotationRequest(
        await getWorkerToken(getState),
        jobId,
      );
      return jobId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to withdraw your quotation",
      );
    }
  },
);

export const fetchMyWorkerJobRequests = createAsyncThunk<
  WorkerJobRequestSummary[],
  void,
  { rejectValue: string }
>(
  "worker/fetchMyJobRequests",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = await getWorkerToken(getState);
      const jobs = await getAllJobs(token);
      const uniqueJobs = Array.from(
        new Map(jobs.filter((job) => job.id).map((job) => [job.id, job])).values(),
      );
      const summaries: WorkerJobRequestSummary[] = [];

      for (let index = 0; index < uniqueJobs.length; index += 5) {
        const jobBatch = uniqueJobs.slice(index, index + 5);
        const requestsByJob = await Promise.all(
          jobBatch.map(async (job) => ({
            job,
            requests: await getWorkerJobRequests(token, job.id),
          })),
        );

        for (const { job, requests } of requestsByJob) {
          for (const request of requests) {
            summaries.push({
              jobId: job.id,
              jobTitle: job.title || job.name || "Job",
              jobStatus: job.status,
              request,
            });
          }
        }
      }

      return summaries.sort(
        (left, right) =>
          new Date(right.request.createdAt).getTime() -
          new Date(left.request.createdAt).getTime(),
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to load your job requests",
      );
    }
  },
);
