import { getStoredAuthToken } from "../auth/authServices";

// export interface ProfileCategory {
//   id: string;
//   nameEn: string;
//   nameSi: string;
//   slug: string;
//   icon: string;
// }

// export interface WorkerExperienceRecord {
//   id: string;
//   companyName: string;
//   jobTitle: string;
//   description?: string | null;
//   startDate: string;
//   endDate: string | null;
//   isCurrent: boolean;
// }

// export interface WorkerEducationRecord {
//   id: string;
//   institution: string;
//   qualification: string;
//   description?: string | null;
//   startDate?: string;
//   endDate?: string | null;
// }

// export interface WorkerPortfolioRecord {
//   id: string;
//   title: string;
//   description?: string | null;
//   completedAt?: string;
// }

// export interface CurrentWorkerProfile {
//   bio?: string | null;
//   experience_years?: number | null;
//   education_summary?: string | null;
//   district?: string | null;
//   city?: string | null;
//   venue?: string | null;
//   approval_status?: string;
//   availability_status?: string;
//   average_rating?: string | number;
//   review_count?: number;
//   categories?: ProfileCategory[];
//   experiences?: WorkerExperienceRecord[];
//   education?: WorkerEducationRecord[];
//   portfolio?: WorkerPortfolioRecord[];
//   bookingRequests?: unknown[];
// }

// export interface CurrentUserProfile {
//   user: AuthUser;
//   profile: CurrentWorkerProfile | null;
// }

// interface CurrentUserResponse {
//   success: boolean;
//   message?: string;
//   data: CurrentUserProfile;
// }

// const BASE_URL = (
//   process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
// ).replace(/\/$/, "");

// export async function getCurrentUserProfile(
//   token: string,
// ): Promise<CurrentUserProfile> {
//   const response = await fetch(`${BASE_URL}/api/user/me`, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const result = (await response.json()) as CurrentUserResponse;

//   if (!response.ok || !result.success) {
//     throw new Error(result.message || "Unable to load your profile");
//   }

//   return result.data;
// }

// export async function getSavedSessionToken(): Promise<string | null> {
//   return getStoredAuthToken();
// }

export interface ProfileCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
  icon: string;
}

export interface WorkerExperienceRecord {
  id?: string;
  companyName: string;
  jobTitle: string;
  description?: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface WorkerEducationRecord {
  id?: string;
  institution: string;
  qualification: string;
  description?: string | null;
  startDate?: string;
  endDate?: string | null;
}

export interface WorkerPortfolioRecord {
  id?: string;
  title: string;
  description?: string | null;
  completedAt?: string;
}

export interface CustomerProfile {
  id?: string;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  venue?: string | null;
}

export interface CurrentWorkerProfile {
  id?: string;
  bio?: string | null;
  experienceYears?: number | null;
  experience_years?: number | null;
  educationSummary?: string | null;
  education_summary?: string | null;
  district?: string | null;
  city?: string | null;
  venue?: string | null;
  approval_status?: string;
  availability_status?: string;
  average_rating?: string | number;
  review_count?: number;
  categories?: ProfileCategory[];
  experiences?: WorkerExperienceRecord[];
  education?: WorkerEducationRecord[];
  portfolio?: WorkerPortfolioRecord[];
  bookingRequests?: unknown[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  avatarPath?: string | null;
  [key: string]: unknown;
}

export interface CurrentUserProfile {
  user: AuthUser;
  profile: CurrentWorkerProfile | CustomerProfile | null;
}

export interface UpdateCustomerProfilePayload {
  address: string;
  district: string;
  city: string;
  venue: string;
}

export interface UpdateWorkerProfilePayload {
  bio: string;
  experienceYears: number;
  educationSummary: string;
  district: string;
  city: string;
  venue: string;
  categoryIds: string[];
  experiences: WorkerExperienceRecord[];
  education: WorkerEducationRecord[];
  portfolio: WorkerPortfolioRecord[];
}

export type WorkerAvailabilityStatus = "AVAILABLE" | "UNAVAILABLE";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");

async function authorizedRequest<T>(
  token: string,
  path: string,
  method: "GET" | "PATCH",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        `Request failed (${response.status}). Please try again.`,
    );
  }

  return result.data;
}

export async function getSavedSessionToken(): Promise<string | null> {
  return getStoredAuthToken();
}

export async function getCurrentUserProfile(
  token: string,
): Promise<CurrentUserProfile> {
  return authorizedRequest<CurrentUserProfile>(token, "/api/user/me", "GET");
}

export async function patchCustomerProfile(
  token: string,
  payload: UpdateCustomerProfilePayload,
): Promise<unknown> {
  return authorizedRequest<unknown>(
    token,
    "/api/user/me/customer-profile",
    "PATCH",
    payload,
  );
}

export async function patchWorkerProfile(
  token: string,
  payload: UpdateWorkerProfilePayload,
): Promise<unknown> {
  return authorizedRequest<unknown>(
    token,
    "/api/user/me/worker-profile",
    "PATCH",
    payload,
  );
}

export async function patchWorkerAvailabilityStatus(
  token: string,
  availabilityStatus: WorkerAvailabilityStatus,
): Promise<unknown> {
  return authorizedRequest<unknown>(
    token,
    "/api/worker/availability-status",
    "PATCH",
    { availabilityStatus },
  );
}
