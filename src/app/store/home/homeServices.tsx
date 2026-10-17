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

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(...values: unknown[]): string | undefined {
  return values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

function getNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsedValue = Number(value);
      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
}

function getResponseCollection(
  body: unknown,
  collectionName: string,
  errorMessage: string,
): unknown[] {
  let value = body;

  if (isRecord(body) && body.success === false) {
    throw new Error(getString(body.message) ?? errorMessage);
  }

  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(value)) {
      return value;
    }

    if (!isRecord(value)) {
      break;
    }

    if (value.success === false) {
      throw new Error(getString(value.message) ?? errorMessage);
    }

    const collection = value[collectionName];
    if (Array.isArray(collection)) {
      return collection;
    }

    if (!("data" in value)) {
      break;
    }

    value = value.data;
  }

  throw new Error(errorMessage);
}

async function fetchApiCollection(
  token: string,
  endpoint: string,
  collectionName: string,
  errorMessage: string,
): Promise<unknown[]> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? `The ${collectionName} response was not valid JSON`
        : `Request failed (${response.status})`,
    );
  }

  if (!response.ok) {
    throw new Error(
      (isRecord(body) && getString(body.message)) ||
        `Request failed (${response.status})`,
    );
  }

  return getResponseCollection(body, collectionName, errorMessage);
}

function normalizeWorker(value: unknown): HomeWorker {
  if (!isRecord(value)) {
    throw new Error("The workers response contains an invalid worker");
  }

  const id = getString(value.id);
  if (!id) {
    throw new Error("The workers response contains a worker without an ID");
  }

  const user = isRecord(value.user) ? value.user : {};
  const location = isRecord(value.location) ? value.location : {};
  const rawCategories =
    Array.isArray(value.categories) && value.categories.length > 0
      ? value.categories
      : [value.category ?? value.profession].filter(Boolean);

  const categories = rawCategories.map((category, index) => {
    const categoryRecord = isRecord(category) ? category : {};
    const name =
      getString(categoryRecord.nameEn, categoryRecord.name, category) ??
      "General Worker";

    return {
      id: getString(categoryRecord.id) ?? `${id}-category-${index}`,
      nameEn: name,
      nameSi: getString(categoryRecord.nameSi) ?? name,
      slug:
        getString(categoryRecord.slug) ??
        name.toLowerCase().replace(/\s+/g, "-"),
      icon: getString(categoryRecord.icon) ?? "construct-outline",
    };
  });

  const rating = getNumber(
    value.averageRating,
    value.average_rating,
    value.rating,
  );

  return {
    id,
    name: getString(value.name, user.name) ?? "Unknown Worker",
    avatarPath:
      getString(value.avatarPath, value.avatar, user.avatarPath, user.avatar) ??
      null,
    bio: getString(value.bio, value.description) ?? null,
    experienceYears:
      getNumber(
        value.experienceYears,
        value.experience_years,
        value.experience,
      ) ?? 0,
    district: getString(value.district, location.district) ?? "",
    city: getString(value.city, location.city) ?? "",
    averageRating: String(rating ?? 0),
    reviewCount: getNumber(value.reviewCount, value.review_count) ?? 0,
    categories,
  };
}

function normalizeJob(value: unknown): HomeJob {
  if (!isRecord(value)) {
    throw new Error("The jobs response contains an invalid job");
  }

  const id = value.id;
  if (typeof id !== "string" && typeof id !== "number") {
    throw new Error("The jobs response contains a job without an ID");
  }

  return { ...value, id: String(id) };
}

export async function getAllWorkers(token: string): Promise<HomeWorker[]> {
  const workers = await fetchApiCollection(
    token,
    "/api/worker/getAllWorkers",
    "workers",
    "Unable to load workers",
  );
  return workers.map(normalizeWorker);
}

export async function getAllJobs(token: string): Promise<HomeJob[]> {
  const jobs = await fetchApiCollection(
    token,
    "/api/customer/getAllJobs",
    "jobs",
    "Unable to load jobs",
  );
  return jobs.map(normalizeJob);
}
