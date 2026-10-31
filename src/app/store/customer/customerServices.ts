import { supabase } from "@/supabase";

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");
const JOB_IMAGES_BUCKET = "apewada-images";

export interface CustomerJobImageRequest {
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  sortOrder: number;
}

export interface CustomerJobImage extends CustomerJobImageRequest {
  id: string;
  createdAt: string;
}

export interface CustomerJob {
  id: string;
  customerId: string;
  title: string;
  description: string;
  categoryId: string;
  categoryNameEn?: string;
  categoryNameSi?: string;
  categorySlug?: string;
  district: string;
  city: string;
  venue: string;
  preferredDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: CustomerJobImage[];
}

export interface CustomerJobDraft {
  title: string;
  description: string;
  categoryId: string;
  district: string;
  city: string;
  venue: string;
  preferredDate: string;
}

export interface CustomerJobUpload {
  uri: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

interface CustomerJobResponse {
  success: boolean;
  message?: string;
  data?: {
    job?: CustomerJob;
  };
}

interface CustomerJobsResponse {
  success: boolean;
  message?: string;
  data?: {
    jobs?: CustomerJob[];
  };
}

function fileExtension(filename: string, mimeType: string) {
  const extension = filename.split(".").pop();
  if (extension && /^[a-z0-9]+$/i.test(extension)) {
    return extension.toLowerCase();
  }

  return mimeType.split("/")[1]?.toLowerCase() || "jpg";
}

function normalizedFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadJobImages(
  customerId: string,
  images: CustomerJobUpload[],
): Promise<CustomerJobImageRequest[]> {
  return Promise.all(
    images.map(async (image, index) => {
      const filename = normalizedFilename(image.filename).replace(
        /\.[^.]+$/,
        "",
      );
      const storagePath = `jobs/${customerId}/${Date.now()}-${index}-${filename}.${fileExtension(
        image.filename,
        image.mimeType,
      )}`;
      const response = await fetch(image.uri);
      if (!response.ok) {
        throw new Error(`Unable to read ${image.filename} for upload`);
      }

      const file = await response.arrayBuffer();
      const { error } = await supabase.storage
        .from(JOB_IMAGES_BUCKET)
        .upload(storagePath, file, {
          contentType: image.mimeType,
          upsert: false,
        });

      if (error) {
        throw new Error(`Unable to upload ${image.filename}: ${error.message}`);
      }

      return {
        storagePath,
        originalFilename: image.filename,
        mimeType: image.mimeType,
        fileSize: image.fileSize || file.byteLength,
        sortOrder: index,
      };
    }),
  );
}

async function submitCustomerJob(
  method: "POST" | "PATCH",
  path: string,
  token: string,
  draft: CustomerJobDraft,
  images: CustomerJobImageRequest[],
): Promise<CustomerJob> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...draft, images }),
  });
  const result = (await response.json()) as CustomerJobResponse;

  if (!response.ok || !result.success || !result.data?.job) {
    throw new Error(result.message || "Unable to save your job");
  }

  return result.data.job;
}

export function createCustomerJob(
  token: string,
  draft: CustomerJobDraft,
  images: CustomerJobImageRequest[],
) {
  return submitCustomerJob("POST", "/api/customer/jobs", token, draft, images);
}

export function updateCustomerJob(
  token: string,
  jobId: string,
  draft: CustomerJobDraft,
  images: CustomerJobImageRequest[],
) {
  return submitCustomerJob(
    "PATCH",
    `/api/customer/jobs/${encodeURIComponent(jobId)}`,
    token,
    draft,
    images,
  );
}

export async function getCustomerJobs(token: string): Promise<CustomerJob[]> {
  const response = await fetch(`${BASE_URL}/api/customer/jobs`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = (await response.json()) as CustomerJobsResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to load your jobs");
  }

  return result.data?.jobs ?? [];
}
