import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSavedSessionToken } from "../profile/profileServices";
import {
  createCustomerJob,
  CustomerJob,
  CustomerJobDraft,
  CustomerJobImageRequest,
  CustomerJobUpload,
  deleteCustomerJob as deleteCustomerJobRequest,
  getCustomerJobRequests,
  getCustomerJobs,
  getCustomerBookings,
  CustomerJobRequest,
  updateCustomerJob,
  uploadJobImages,
} from "./customerServices";

type ApiAuthState = {
  apiAuth?: {
    token?: string | null;
    user?: { id?: string } | null;
  };
  profile?: {
    data?: {
      user?: { id?: string };
    } | null;
  };
};

async function getSession(
  getState: () => unknown,
): Promise<{ token: string; customerId: string }> {
  const state = getState() as ApiAuthState;
  const token = state.apiAuth?.token ?? (await getSavedSessionToken());
  const customerId = state.profile?.data?.user?.id ?? state.apiAuth?.user?.id;

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!customerId) {
    throw new Error("Unable to identify the current customer.");
  }

  return { token, customerId };
}

interface CreateCustomerJobPayload {
  draft: CustomerJobDraft;
  images: CustomerJobUpload[];
}

interface UpdateCustomerJobPayload extends CreateCustomerJobPayload {
  jobId: string;
  existingImages: CustomerJobImageRequest[];
}

export const fetchCustomerJobs = createAsyncThunk<
  CustomerJob[],
  void,
  { rejectValue: string }
>("customer/fetchJobs", async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = await getSession(getState);
    return await getCustomerJobs(token);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load your jobs",
    );
  }
});

export const fetchCustomerJobRequests = createAsyncThunk<
  { jobId: string; requests: CustomerJobRequest[] },
  string,
  { rejectValue: string }
>(
  "customer/fetchJobRequests",
  async (jobId, { getState, rejectWithValue }) => {
    try {
      const { token } = await getSession(getState);
      return {
        jobId,
        requests: await getCustomerJobRequests(token, jobId),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to load worker requests",
      );
    }
  },
);

export const fetchCustomerBookings = createAsyncThunk<
  Awaited<ReturnType<typeof getCustomerBookings>>,
  void,
  { rejectValue: string }
>("customer/fetchBookings", async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = await getSession(getState);
    return await getCustomerBookings(token);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Unable to load your booking requests",
    );
  }
});

export const submitCustomerJob = createAsyncThunk<
  CustomerJob,
  CreateCustomerJobPayload,
  { rejectValue: string }
>("customer/submitJob", async ({ draft, images }, { getState, rejectWithValue }) => {
  try {
    const { token, customerId } = await getSession(getState);
    const uploadedImages = await uploadJobImages(customerId, images);
    return await createCustomerJob(token, draft, uploadedImages);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to create your job",
    );
  }
});

export const editCustomerJob = createAsyncThunk<
  CustomerJob,
  UpdateCustomerJobPayload,
  { rejectValue: string }
>(
  "customer/editJob",
  async (
    { jobId, draft, images, existingImages },
    { getState, rejectWithValue },
  ) => {
    try {
      const { token, customerId } = await getSession(getState);
      const uploadedImages = await uploadJobImages(customerId, images);
      return await updateCustomerJob(token, jobId, draft, [
        ...existingImages.map((image, index) => ({
          ...image,
          sortOrder: index,
        })),
        ...uploadedImages.map((image, index) => ({
          ...image,
          sortOrder: existingImages.length + index,
        })),
      ]);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to update your job",
      );
    }
  },
);

export const deleteCustomerJob = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "customer/deleteJob",
  async (jobId, { getState, rejectWithValue }) => {
    try {
      const { token } = await getSession(getState);
      await deleteCustomerJobRequest(token, jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to delete your job",
      );
    }
  },
);
