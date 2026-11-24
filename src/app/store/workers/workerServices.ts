export interface WorkerQuotationPayload {
  proposedBudget: number;
  message: string;
  proposedDate: string;
}

export interface WorkerJobRequest {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerAvatarPath?: string | null;
  workerBio?: string | null;
  experienceYears?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  proposedBudget: string | number;
  message: string;
  proposedDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    requests?: WorkerJobRequest[];
  };
}

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");

export async function submitWorkerQuotation(
  token: string,
  jobId: string,
  quotation: WorkerQuotationPayload,
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/api/worker/jobs/${encodeURIComponent(jobId)}/requests`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(quotation),
    },
  );
  const result = (await response.json().catch(() => null)) as
    | ApiResponse
    | null;

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        `Unable to submit your quotation (${response.status}). Please try again.`,
    );
  }
}

async function updatePendingWorkerQuotation(
  token: string,
  jobId: string,
  method: "PATCH" | "DELETE",
  quotation?: WorkerQuotationPayload,
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/api/worker/jobs/${encodeURIComponent(jobId)}/requests`,
    {
      method,
      headers: {
        Accept: "application/json",
        ...(quotation ? { "Content-Type": "application/json" } : {}),
        Authorization: "Bearer " + token,
      },
      ...(quotation ? { body: JSON.stringify(quotation) } : {}),
    },
  );
  const result = (await response.json().catch(() => null)) as
    | ApiResponse
    | null;

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        `Unable to ${method === "PATCH" ? "update" : "withdraw"} your quotation (${response.status}).`,
    );
  }
}

export function editWorkerQuotation(
  token: string,
  jobId: string,
  quotation: WorkerQuotationPayload,
): Promise<void> {
  return updatePendingWorkerQuotation(token, jobId, "PATCH", quotation);
}

export function withdrawWorkerQuotation(
  token: string,
  jobId: string,
): Promise<void> {
  return updatePendingWorkerQuotation(token, jobId, "DELETE");
}

export async function getWorkerJobRequests(
  token: string,
  jobId: string,
): Promise<WorkerJobRequest[]> {
  const response = await fetch(
    `${BASE_URL}/api/worker/jobs/${encodeURIComponent(jobId)}/requests`,
    {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    },
  );
  const result = (await response.json().catch(() => null)) as
    | ApiResponse
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        `Unable to load your request for job ${jobId} (${response.status}).`,
    );
  }

  return result.data?.requests ?? [];
}
