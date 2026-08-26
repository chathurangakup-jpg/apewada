// store/workers/workerApi.ts
import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  Worker,
  WorkerFilters,
  WorkerResponse,
} from "./worker.types";

// Mock data for development - Complete worker profiles
const MOCK_WORKERS: Worker[] = [
  {
    id: "worker-1",
    userId: "user-1",
    user: {
      id: "user-1",
      name: "Kasun Perera",
      avatar: "https://i.pravatar.cc/300?img=12",
      email: "kasun@example.com",
      phone: "+94771234567",
    },
    profession: "Plumber",
    category: "plumbing",
    rating: 4.9,
    totalJobs: 128,
    verified: true,
    location: {
      district: "Colombo",
      city: "Nugegoda",
      address: "45 Lake Road, Nugegoda",
      coordinates: {
        lat: 6.8707,
        lng: 79.8856,
      },
    },
    services: [
      {
        id: "s1",
        name: "Pipe Repair",
        description: "Fixing leaking pipes and plumbing issues",
        price: 1500,
        duration: "1-2 hours",
      },
      {
        id: "s2",
        name: "Bathroom Plumbing",
        description: "Complete bathroom plumbing installation and repair",
        price: 5000,
        duration: "4-6 hours",
      },
      {
        id: "s3",
        name: "Water Tank Installation",
        description: "Installation of water tanks and plumbing connections",
        price: 8000,
        duration: "6-8 hours",
      },
    ],
    experience: 8,
    availability: {
      status: "available",
      schedule: [
        "Monday-Friday: 8:00 AM - 6:00 PM",
        "Saturday: 8:00 AM - 2:00 PM",
      ],
    },
    hourlyRate: 1500,
    description:
      "Experienced plumber with over 8 years of experience in residential and commercial plumbing. Specializing in pipe repairs, bathroom installations, and water tank systems.",
    skills: [
      "Pipe installation",
      "Leak detection",
      "Bathroom fitting",
      "Water heating systems",
      "Drainage systems",
    ],
    certifications: [
      "Licensed Plumber",
      "Safety Certified",
      "Water Systems Expert",
    ],
    languages: ["Sinhala", "English", "Tamil"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "worker-2",
    userId: "user-2",
    user: {
      id: "user-2",
      name: "Nimal Fernando",
      avatar: "https://i.pravatar.cc/300?img=13",
      email: "nimal@example.com",
      phone: "+94772345678",
    },
    profession: "Electrician",
    category: "electrical",
    rating: 4.8,
    totalJobs: 96,
    verified: true,
    location: {
      district: "Kalutara",
      city: "Panadura",
      address: "78 Station Road, Panadura",
      coordinates: {
        lat: 6.7134,
        lng: 79.9038,
      },
    },
    services: [
      {
        id: "s4",
        name: "House Wiring",
        description: "Complete house electrical wiring installation",
        price: 3000,
        duration: "2-3 hours",
      },
      {
        id: "s5",
        name: "Electrical Repair",
        description: "Fix electrical faults and repairs",
        price: 1500,
        duration: "1-2 hours",
      },
      {
        id: "s6",
        name: "Light Installation",
        description: "Install lighting fixtures and systems",
        price: 2000,
        duration: "1-3 hours",
      },
    ],
    experience: 6,
    availability: {
      status: "available",
      schedule: [
        "Monday-Friday: 9:00 AM - 5:00 PM",
        "Saturday: 9:00 AM - 1:00 PM",
      ],
    },
    hourlyRate: 1200,
    description:
      "Certified electrician with 6 years of experience in residential and commercial electrical work. Expert in house wiring, electrical repairs, and lighting installations.",
    skills: [
      "Electrical wiring",
      "Circuit breakers",
      "Lighting systems",
      "Electrical safety",
      "Home automation",
    ],
    certifications: [
      "Licensed Electrician",
      "Safety Certified",
      "Smart Home Specialist",
    ],
    languages: ["Sinhala", "English"],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "worker-3",
    userId: "user-3",
    user: {
      id: "user-3",
      name: "Ruwan Silva",
      avatar: "https://i.pravatar.cc/300?img=14",
      email: "ruwan@example.com",
      phone: "+94773456789",
    },
    profession: "Carpenter",
    category: "carpentry",
    rating: 4.7,
    totalJobs: 84,
    verified: true,
    location: {
      district: "Gampaha",
      city: "Kadawatha",
      address: "123 Main Street, Kadawatha",
      coordinates: {
        lat: 6.9356,
        lng: 79.9641,
      },
    },
    services: [
      {
        id: "s7",
        name: "Furniture Repair",
        description: "Fix and restore wooden furniture",
        price: 2500,
        duration: "2-4 hours",
      },
      {
        id: "s8",
        name: "Custom Furniture",
        description: "Build custom wooden furniture",
        price: 10000,
        duration: "2-5 days",
      },
      {
        id: "s9",
        name: "Door Installation",
        description: "Install new doors and door frames",
        price: 4000,
        duration: "3-5 hours",
      },
    ],
    experience: 10,
    availability: {
      status: "busy",
      schedule: [
        "Monday-Saturday: 8:00 AM - 6:00 PM",
        "Sunday: By appointment",
      ],
    },
    hourlyRate: 1800,
    description:
      "Master carpenter with 10 years of experience specializing in custom furniture, cabinetry, and door installations. Precision craftsmanship with attention to detail.",
    skills: [
      "Custom furniture",
      "Cabinetry",
      "Woodworking",
      "Joinery",
      "Finishing",
    ],
    certifications: ["Master Carpenter", "Woodworking Specialist"],
    languages: ["Sinhala", "English"],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "worker-4",
    userId: "user-4",
    user: {
      id: "user-4",
      name: "Chaminda Jayasuriya",
      avatar: "https://i.pravatar.cc/300?img=15",
      email: "chaminda@example.com",
      phone: "+94774567890",
    },
    profession: "Gardener",
    category: "gardening",
    rating: 4.6,
    totalJobs: 72,
    verified: false,
    location: {
      district: "Colombo",
      city: "Maharagama",
      address: "56 Green Lane, Maharagama",
      coordinates: {
        lat: 6.8495,
        lng: 79.925,
      },
    },
    services: [
      {
        id: "s10",
        name: "Garden Maintenance",
        description: "Regular garden maintenance and care",
        price: 2000,
        duration: "2-3 hours",
      },
      {
        id: "s11",
        name: "Tree Trimming",
        description: "Professional tree trimming and pruning",
        price: 3500,
        duration: "2-4 hours",
      },
      {
        id: "s12",
        name: "Planting",
        description: "Plant new trees, flowers, and shrubs",
        price: 1500,
        duration: "1-3 hours",
      },
    ],
    experience: 5,
    availability: {
      status: "available",
      schedule: ["Monday-Saturday: 6:00 AM - 4:00 PM", "Sunday: Closed"],
    },
    hourlyRate: 800,
    description:
      "Professional gardener with 5 years of experience in garden maintenance, landscaping, and tree care. Passionate about creating beautiful outdoor spaces.",
    skills: [
      "Garden maintenance",
      "Tree pruning",
      "Landscaping",
      "Plant care",
      "Lawn mowing",
    ],
    certifications: ["Gardening Certificate", "Landscaping Diploma"],
    languages: ["Sinhala", "English"],
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "worker-5",
    userId: "user-5",
    user: {
      id: "user-5",
      name: "Tharindu Kumara",
      avatar: "https://i.pravatar.cc/300?img=16",
      email: "tharindu@example.com",
      phone: "+94775678901",
    },
    profession: "Painter",
    category: "painting",
    rating: 4.8,
    totalJobs: 65,
    verified: true,
    location: {
      district: "Kandy",
      city: "Peradeniya",
      address: "89 Hill Street, Peradeniya",
      coordinates: {
        lat: 7.2623,
        lng: 80.6082,
      },
    },
    services: [
      {
        id: "s13",
        name: "House Painting",
        description: "Complete house painting services",
        price: 8000,
        duration: "2-4 days",
      },
      {
        id: "s14",
        name: "Wall Painting",
        description: "Interior and exterior wall painting",
        price: 5000,
        duration: "1-2 days",
      },
      {
        id: "s15",
        name: "Interior Painting",
        description: "Premium interior painting and finishing",
        price: 6000,
        duration: "2-3 days",
      },
    ],
    experience: 7,
    availability: {
      status: "available",
      schedule: ["Monday-Saturday: 7:00 AM - 5:00 PM"],
    },
    hourlyRate: 1000,
    description:
      "Professional painter with 7 years of experience in residential and commercial painting. Specializing in high-quality finishes and color consultation.",
    skills: [
      "Interior painting",
      "Exterior painting",
      "Wall preparation",
      "Color matching",
      "Decorative finishes",
    ],
    certifications: ["Painting Professional", "Color Consultant"],
    languages: ["Sinhala", "English", "Tamil"],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "worker-6",
    userId: "user-6",
    user: {
      id: "user-6",
      name: "Saman Wijesinghe",
      avatar: "https://i.pravatar.cc/300?img=17",
      email: "saman@example.com",
      phone: "+94776789012",
    },
    profession: "Grass Cutter",
    category: "grass cutting",
    rating: 4.5,
    totalJobs: 53,
    verified: false,
    location: {
      district: "Kalutara",
      city: "Beruwala",
      address: "12 Beach Road, Beruwala",
      coordinates: {
        lat: 6.4754,
        lng: 79.9842,
      },
    },
    services: [
      {
        id: "s16",
        name: "Grass Cutting",
        description: "Professional grass cutting services",
        price: 1500,
        duration: "1-2 hours",
      },
      {
        id: "s17",
        name: "Garden Cleaning",
        description: "Comprehensive garden cleaning and maintenance",
        price: 2500,
        duration: "2-3 hours",
      },
      {
        id: "s18",
        name: "Weed Removal",
        description: "Professional weed removal services",
        price: 1200,
        duration: "1-2 hours",
      },
    ],
    experience: 3,
    availability: {
      status: "available",
      schedule: ["Monday-Saturday: 7:00 AM - 3:00 PM"],
    },
    hourlyRate: 700,
    description:
      "Professional grass cutting and garden maintenance services with 3 years of experience. Reliable and efficient service with attention to detail.",
    skills: [
      "Grass cutting",
      "Garden cleaning",
      "Weed removal",
      "Lawn maintenance",
    ],
    certifications: ["Gardening Certificate"],
    languages: ["Sinhala", "English"],
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z",
  },
];

// Base URL - replace with your actual API URL when ready
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com";

// Set to false when the backend API is ready.
const USE_MOCK_DATA = true;

// queryFn must return { data } or { error }. This helper converts the
// generic fetchBaseQuery result into the exact result expected by RTK Query.
const executeBaseQuery = async <T>(
  baseQuery: (arg: string | FetchArgs) => any,
  args: string | FetchArgs,
): Promise<{ data: T } | { error: FetchBaseQueryError }> => {
  const result = await baseQuery(args);

  if ("error" in result) {
    return { error: result.error };
  }

  return { data: result.data as T };
};

export const workerApi = createApi({
  reducerPath: "workerApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      // React Native does not provide localStorage by default.
      // Add your auth token here when you connect your auth storage.
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  tagTypes: ["Worker", "Workers"],

  endpoints: (builder) => ({
    // Get all workers with filters
    getWorkers: builder.query<WorkerResponse, WorkerFilters>({
      queryFn: async (filters, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          let filtered = [...MOCK_WORKERS];

          if (filters.category) {
            filtered = filtered.filter(
              (w) =>
                w.category.toLowerCase() === filters.category!.toLowerCase(),
            );
          }

          if (filters.district) {
            filtered = filtered.filter(
              (w) => w.location.district === filters.district,
            );
          }

          if (filters.city) {
            filtered = filtered.filter((w) =>
              w.location.city
                .toLowerCase()
                .includes(filters.city!.toLowerCase()),
            );
          }

          if (filters.search) {
            const search = filters.search.toLowerCase();

            filtered = filtered.filter(
              (w) =>
                w.user.name.toLowerCase().includes(search) ||
                w.profession.toLowerCase().includes(search) ||
                w.location.district.toLowerCase().includes(search) ||
                w.location.city.toLowerCase().includes(search),
            );
          }

          if (filters.rating !== undefined) {
            filtered = filtered.filter((w) => w.rating >= filters.rating!);
          }

          if (filters.verified !== undefined) {
            filtered = filtered.filter((w) => w.verified === filters.verified);
          }

          const page = filters.page || 1;
          const limit = filters.limit || 10;
          const start = (page - 1) * limit;
          const end = start + limit;

          return {
            data: {
              workers: filtered.slice(start, end),
              total: filtered.length,
              page,
              limit,
            },
          };
        }

        const params = new URLSearchParams();

        if (filters.category) {
          params.append("category", filters.category);
        }

        if (filters.district) {
          params.append("district", filters.district);
        }

        if (filters.city) {
          params.append("city", filters.city);
        }

        if (filters.search) {
          params.append("search", filters.search);
        }

        if (filters.rating !== undefined) {
          params.append("rating", filters.rating.toString());
        }

        if (filters.verified !== undefined) {
          params.append("verified", filters.verified.toString());
        }

        if (filters.page) {
          params.append("page", filters.page.toString());
        }

        if (filters.limit) {
          params.append("limit", filters.limit.toString());
        }

        return executeBaseQuery<WorkerResponse>(baseQuery, {
          url: `/workers?${params.toString()}`,
          method: "GET",
        });
      },

      providesTags: (result) =>
        result
          ? [
              ...result.workers.map(({ id }) => ({
                type: "Worker" as const,
                id,
              })),
              { type: "Workers" as const, id: "LIST" },
            ]
          : [{ type: "Workers" as const, id: "LIST" }],
    }),

    // Get featured workers
    getFeaturedWorkers: builder.query<
      Worker[],
      { limit?: number; district?: string }
    >({
      queryFn: async (
        { limit = 5, district },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        if (USE_MOCK_DATA) {
          let filtered = [...MOCK_WORKERS];

          if (district) {
            filtered = filtered.filter((w) => w.location.district === district);
          }

          const sorted = filtered.sort((a, b) => b.rating - a.rating);

          return {
            data: sorted.slice(0, limit),
          };
        }

        const params = new URLSearchParams();

        params.append("limit", limit.toString());
        params.append("featured", "true");

        if (district) {
          params.append("district", district);
        }

        return executeBaseQuery<Worker[]>(baseQuery, {
          url: `/workers/featured?${params.toString()}`,
          method: "GET",
        });
      },

      providesTags: ["Workers"],
    }),

    // Get worker by ID
    getWorkerById: builder.query<Worker, string>({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const worker = MOCK_WORKERS.find((w) => w.id === id);

          if (worker) {
            return {
              data: worker,
            };
          }

          return {
            error: {
              status: 404,
              data: "Worker not found",
            } as FetchBaseQueryError,
          };
        }

        return executeBaseQuery<Worker>(baseQuery, {
          url: `/workers/${id}`,
          method: "GET",
        });
      },

      providesTags: (_result, _error, id) => [{ type: "Worker", id }],
    }),

    // Get workers by category
    getWorkersByCategory: builder.query<
      Worker[],
      { category: string; limit?: number }
    >({
      queryFn: async (
        { category, limit = 10 },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        if (USE_MOCK_DATA) {
          const filtered = MOCK_WORKERS.filter(
            (w) => w.category.toLowerCase() === category.toLowerCase(),
          );

          return {
            data: filtered.slice(0, limit),
          };
        }

        const params = new URLSearchParams();

        params.append("limit", limit.toString());

        return executeBaseQuery<Worker[]>(baseQuery, {
          url: `/workers/category/${encodeURIComponent(category)}?${params.toString()}`,
          method: "GET",
        });
      },

      providesTags: ["Workers"],
    }),

    // Create new worker profile
    createWorker: builder.mutation<Worker, CreateWorkerDto>({
      queryFn: async (workerData, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const newWorker: Worker = {
            id: `worker-${Date.now()}`,
            userId: workerData.userId,
            user: {
              id: workerData.userId,
              name: "New Worker",
              avatar: "https://i.pravatar.cc/300",
            },
            profession: workerData.profession,
            category: workerData.category,
            rating: 0,
            totalJobs: 0,
            verified: false,
            location: workerData.location,
            services: workerData.services,
            hourlyRate: workerData.hourlyRate,
            description: workerData.description,
            experience: workerData.experience,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          MOCK_WORKERS.push(newWorker);

          return {
            data: newWorker,
          };
        }

        return executeBaseQuery<Worker>(baseQuery, {
          url: "/workers",
          method: "POST",
          body: workerData,
        });
      },

      invalidatesTags: ["Workers"],
    }),

    // Update worker profile
    updateWorker: builder.mutation<
      Worker,
      { id: string; data: UpdateWorkerDto }
    >({
      queryFn: async ({ id, data }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const index = MOCK_WORKERS.findIndex((w) => w.id === id);

          if (index === -1) {
            return {
              error: {
                status: 404,
                data: "Worker not found",
              } as FetchBaseQueryError,
            };
          }

          MOCK_WORKERS[index] = {
            ...MOCK_WORKERS[index],
            ...data,
            updatedAt: new Date().toISOString(),
          };

          return {
            data: MOCK_WORKERS[index],
          };
        }

        return executeBaseQuery<Worker>(baseQuery, {
          url: `/workers/${id}`,
          method: "PATCH",
          body: data,
        });
      },

      invalidatesTags: (_result, _error, { id }) => [
        { type: "Worker", id },
        { type: "Workers", id: "LIST" },
      ],
    }),

    // Rate a worker
    rateWorker: builder.mutation<
      Worker,
      { workerId: string; rating: number; review?: string }
    >({
      queryFn: async (
        { workerId, rating, review },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        if (USE_MOCK_DATA) {
          const index = MOCK_WORKERS.findIndex((w) => w.id === workerId);

          if (index === -1) {
            return {
              error: {
                status: 404,
                data: "Worker not found",
              } as FetchBaseQueryError,
            };
          }

          const currentTotal = MOCK_WORKERS[index].totalJobs || 0;
          const currentRating = MOCK_WORKERS[index].rating || 0;
          const newRating =
            (currentRating * currentTotal + rating) / (currentTotal + 1);

          MOCK_WORKERS[index] = {
            ...MOCK_WORKERS[index],
            rating: Math.round(newRating * 10) / 10,
            totalJobs: currentTotal + 1,
            updatedAt: new Date().toISOString(),
          };

          return {
            data: MOCK_WORKERS[index],
          };
        }

        return executeBaseQuery<Worker>(baseQuery, {
          url: `/workers/${workerId}/rate`,
          method: "POST",
          body: {
            rating,
            review,
          },
        });
      },

      invalidatesTags: (_result, _error, { workerId }) => [
        { type: "Worker", id: workerId },
        { type: "Workers", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetWorkersQuery,
  useGetFeaturedWorkersQuery,
  useGetWorkerByIdQuery,
  useGetWorkersByCategoryQuery,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  useRateWorkerMutation,
} = workerApi;
