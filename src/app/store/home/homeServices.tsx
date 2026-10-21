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
  user?: {
    id?: string;
    name?: string;
    avatar?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  profession?: string;
  rating?: number;
  totalJobs?: number;
  verified?: boolean;
  location?: {
    district?: string;
    city?: string;
    address?: string;
  };
  experience?: number;
  hourlyRate?: number;
  description?: string;
  services?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: string;
  }[];
  skills?: string[];
  educationSummary?: string | null;
  experiences?: {
    id: string;
    companyName: string;
    jobTitle: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
  }[];
  education?: {
    id: string;
    institution: string;
    qualification: string;
    description?: string | null;
    startDate?: string;
    endDate?: string | null;
  }[];
  portfolio?: {
    id: string;
    title: string;
    description?: string | null;
    completedAt?: string | null;
  }[];
  availability?: {
    status: string;
    schedule?: string[];
  };
  certifications?: string[];
}
export interface HomeJob {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string | { slug?: string; nameEn?: string };
  categoryNameEn?: string;
  categoryNameSi?: string;
  categorySlug?: string;
  categoryId?: string;
  location?: { district?: string; city?: string };
  district?: string;
  city?: string;
  venue?: string | null;
  preferredDate?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  customerId?: string;
  clientId?: string;
  customer?: {
    id?: string;
    name?: string;
    avatarPath?: string | null;
  };
  images?: string[];
  image?: string;
  budget?: number;
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

async function fetchApiItem(
  token: string,
  endpoint: string,
  itemName: string,
  errorMessage: string,
): Promise<unknown> {
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
        ? "The response was not valid JSON"
        : `Request failed (${response.status})`,
    );
  }

  if (!response.ok) {
    throw new Error(
      (isRecord(body) && getString(body.message)) ||
        `Request failed (${response.status})`,
    );
  }

  let value = body;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!isRecord(value)) {
      break;
    }

    if (value.success === false) {
      throw new Error(getString(value.message) ?? errorMessage);
    }

    if (itemName in value) {
      return value[itemName];
    }

    if (!("data" in value)) {
      break;
    }

    value = value.data;
  }

  if (isRecord(value) && getString(value.id)) {
    return value;
  }

  throw new Error(errorMessage);
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
  const services = Array.isArray(value.services)
    ? value.services.flatMap((service, index) => {
        if (!isRecord(service)) {
          return [];
        }

        const name = getString(service.name, service.title);
        if (!name) {
          return [];
        }

        return [
          {
            id: getString(service.id) ?? `${id}-service-${index}`,
            name,
            description: getString(service.description),
            price: getNumber(service.price),
            duration: getString(service.duration),
          },
        ];
      })
    : [];
  const rawAvailability = isRecord(value.availability)
    ? value.availability
    : {};
  const rawSchedule = rawAvailability.schedule;
  const rawSkills = Array.isArray(value.skills) ? value.skills : [];
  const rawCertifications = Array.isArray(value.certifications)
    ? value.certifications
    : [];
  const experiences = Array.isArray(value.experiences)
    ? value.experiences.flatMap((experience, index) => {
        if (!isRecord(experience)) {
          return [];
        }

        const companyName = getString(experience.companyName);
        const jobTitle = getString(experience.jobTitle);
        if (!companyName && !jobTitle) {
          return [];
        }

        return [
          {
            id: getString(experience.id) ?? `${id}-experience-${index}`,
            companyName: companyName ?? "—",
            jobTitle: jobTitle ?? "—",
            description: getString(experience.description) ?? null,
            startDate: getString(experience.startDate) ?? "",
            endDate: getString(experience.endDate) ?? null,
            isCurrent: experience.isCurrent === true,
          },
        ];
      })
    : [];
  const education = Array.isArray(value.education)
    ? value.education.flatMap((entry, index) => {
        if (!isRecord(entry)) {
          return [];
        }

        const institution = getString(entry.institution);
        const qualification = getString(entry.qualification);
        if (!institution && !qualification) {
          return [];
        }

        return [
          {
            id: getString(entry.id) ?? `${id}-education-${index}`,
            institution: institution ?? "—",
            qualification: qualification ?? "—",
            description: getString(entry.description) ?? null,
            startDate: getString(entry.startDate),
            endDate: getString(entry.endDate) ?? null,
          },
        ];
      })
    : [];
  const portfolio = Array.isArray(value.portfolio)
    ? value.portfolio.flatMap((item, index) => {
        if (!isRecord(item)) {
          return [];
        }

        const title = getString(item.title);
        if (!title) {
          return [];
        }

        return [
          {
            id: getString(item.id) ?? `${id}-portfolio-${index}`,
            title,
            description: getString(item.description) ?? null,
            completedAt: getString(item.completedAt) ?? null,
          },
        ];
      })
    : [];

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
    user: {
      id: getString(user.id),
      name: getString(user.name, value.name),
      avatar:
        getString(
          user.avatarPath,
          user.avatar,
          value.avatarPath,
          value.avatar,
        ) ?? null,
      phone: getString(user.phone, value.phone) ?? null,
      email: getString(user.email, value.email) ?? null,
    },
    profession:
      getString(value.profession) ??
      categories.map((category) => category.nameEn).join(", "),
    rating,
    totalJobs: getNumber(value.totalJobs, value.total_jobs) ?? 0,
    verified:
      value.verified === true ||
      value.isVerified === true ||
      getString(value.approvalStatus, value.approval_status) === "APPROVED",
    location: {
      district: getString(location.district, value.district) ?? "",
      city: getString(location.city, value.city) ?? "",
      address: getString(location.address, value.venue),
    },
    experience: getNumber(
      value.experience,
      value.experienceYears,
      value.experience_years,
    ),
    hourlyRate: getNumber(value.hourlyRate, value.hourly_rate),
    description: getString(value.description, value.bio) ?? "",
    services,
    skills: rawSkills.filter(
      (skill): skill is string => typeof skill === "string",
    ),
    educationSummary:
      getString(value.educationSummary, value.education_summary) ?? null,
    experiences,
    education,
    portfolio,
    availability: getString(
      rawAvailability.status,
      value.availabilityStatus,
      value.availability_status,
    )
      ? {
          status: (
            getString(
              rawAvailability.status,
              value.availabilityStatus,
              value.availability_status,
            ) ?? ""
          ).toLowerCase(),
          schedule: Array.isArray(rawSchedule)
            ? rawSchedule.filter(
                (schedule): schedule is string => typeof schedule === "string",
              )
            : [],
        }
      : undefined,
    certifications: rawCertifications.filter(
      (certification): certification is string =>
        typeof certification === "string",
    ),
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

export async function getWorkerById(
  token: string,
  workerId: string,
): Promise<HomeWorker> {
  const worker = await fetchApiItem(
    token,
    `/api/worker/getWorkerById/${encodeURIComponent(workerId)}`,
    "worker",
    "Unable to load worker details",
  );
  return normalizeWorker(worker);
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

export async function getJobById(
  token: string,
  jobId: string,
): Promise<HomeJob> {
  const value = await fetchApiItem(
    token,
    `/api/customer/getJobById/${encodeURIComponent(jobId)}`,
    "job",
    "Unable to load job details",
  );
  const job = normalizeJob(value);
  const customer = isRecord(job.customer) ? job.customer : undefined;
  const city = getString(job.city, job.location?.city);
  const district = getString(job.district, job.location?.district);

  return {
    ...job,
    category:
      getString(job.categoryNameEn, job.category as unknown) ?? "General",
    location: {
      district,
      city,
    },
    customer: customer
      ? {
          id: getString(customer.id),
          name: getString(customer.name) ?? "Customer",
          avatarPath: getString(customer.avatarPath) ?? null,
        }
      : undefined,
    clientId: getString(job.customerId, job.clientId),
    images: Array.isArray(job.images)
      ? job.images.filter((image): image is string => typeof image === "string")
      : [],
  };
}
