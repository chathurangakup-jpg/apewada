export interface HomeCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
  icon: string;
}

export interface HomeWorker {
  id: string;
  user?: {
    name?: string;
    avatar?: string;
  };
  profession?: string;
  category?: string | { slug?: string; nameEn?: string };
  rating?: number;
  totalJobs?: number;
  verified?: boolean;
  location?: { district?: string };
  district?: string;
}

export interface HomeJob {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string | { slug?: string; nameEn?: string };
  location?: { district?: string };
  district?: string;
  [key: string]: unknown;
}

export interface HomeData {
  categories: HomeCategory[];
  topRatedWorkers: HomeWorker[];
  recentJobs: HomeJob[];
}

interface HomeDataResponse {
  success: boolean;
  message: string;
  data: HomeData;
}

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com";

export async function getHomeData(): Promise<HomeData> {
  const response = await fetch(`${BASE_URL}/api/user/getData`, {
    headers: { "Content-Type": "application/json" },
  });
  const result = (await response.json()) as HomeDataResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to load home data");
  }

  return result.data;
}
