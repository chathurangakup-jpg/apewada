import { AuthUser, getStoredAuthToken } from "../auth/authServices";

export interface ProfileCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
  icon: string;
}

export interface WorkerExperienceRecord {
  id: string;
  companyName: string;
  jobTitle: string;
  description?: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface WorkerEducationRecord {
  id: string;
  institution: string;
  qualification: string;
  description?: string | null;
  startDate?: string;
  endDate?: string | null;
}

export interface WorkerPortfolioRecord {
  id: string;
  title: string;
  description?: string | null;
  completedAt?: string;
}

export interface CurrentWorkerProfile {
  bio?: string | null;
  experience_years?: number | null;
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

export interface CurrentUserProfile {
  user: AuthUser;
  profile: CurrentWorkerProfile | null;
}

interface CurrentUserResponse {
  success: boolean;
  message?: string;
  data: CurrentUserProfile;
}

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/$/, "");

export async function getCurrentUserProfile(
  token: string,
): Promise<CurrentUserProfile> {
  const response = await fetch(`${BASE_URL}/api/user/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = (await response.json()) as CurrentUserResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to load your profile");
  }

  return result.data;
}

export async function getSavedSessionToken(): Promise<string | null> {
  return getStoredAuthToken();
}
