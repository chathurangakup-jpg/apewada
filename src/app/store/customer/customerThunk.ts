import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSavedSessionToken } from "../profile/profileServices";
import {
  createCustomerJob,
  CustomerJob,
  CustomerJobDraft,
  CustomerJobImageRequest,
  CustomerJobUpload,
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
