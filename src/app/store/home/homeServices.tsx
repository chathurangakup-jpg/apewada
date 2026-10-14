export interface HomeCategory {
  id: string;
  nameEn: string;
  nameSi: string;
  slug: string;
  icon: string;
}

export interface HomeWorker {
  id: string;
  name: string;
  avatarPath: string | null;
  bio: string | null;
  experienceYears: number;
  district: string;
  city: string;
  averageRating: string;
  reviewCount: number;
  categories: {
    id: string;
    nameEn: string;
    nameSi: string;
    slug: string;
    icon: string;
  }[];
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
  console.log("Home data response:", JSON.stringify(result));

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to load home data");
  }

  return result.data;
}
