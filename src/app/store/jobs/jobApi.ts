// store/jobs/jobApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CreateJobDto,
  Job,
  JobFilters,
  JobResponse,
  UpdateJobDto,
} from "./job.types";

// Mock data for development
const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Bathroom Plumbing Repair",
    description:
      "Need an experienced plumber to repair leaking pipes in the bathroom.",
    category: "Plumbing",
    budget: 15000,
    location: { district: "Colombo", city: "Nugegoda" },
    clientId: "client-1",
    status: "open",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "job-2",
    title: "House Electrical Wiring",
    description:
      "Looking for an electrician to complete electrical wiring for a new house.",
    category: "Electrical",
    budget: 45000,
    location: { district: "Kalutara", city: "Panadura" },
    clientId: "client-2",
    status: "open",
    createdAt: "2024-01-16T14:30:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
  },
  {
    id: "job-3",
    title: "Custom Kitchen Cabinets",
    description:
      "Need a skilled carpenter to build and install custom kitchen cabinets.",
    category: "Carpentry",
    budget: 85000,
    location: { district: "Gampaha", city: "Kadawatha" },
    clientId: "client-3",
    status: "open",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
  {
    id: "job-4",
    title: "Garden Cleaning",
    description: "Need someone to clean and maintain a residential garden.",
    category: "Gardening",
    budget: 12000,
    location: { district: "Colombo", city: "Maharagama" },
    clientId: "client-4",
    status: "open",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "job-5",
    title: "House Exterior Painting",
    description:
      "Looking for an experienced painter to paint the exterior of a house.",
    category: "Painting",
    budget: 60000,
    location: { district: "Kandy", city: "Peradeniya" },
    clientId: "client-5",
    status: "open",
    createdAt: "2024-01-19T11:20:00Z",
    updatedAt: "2024-01-19T11:20:00Z",
  },
  {
    id: "job-6",
    title: "Large Garden Grass Cutting",
    description:
      "Need regular grass cutting and garden cleaning for a large property.",
    category: "Grass Cutting",
    budget: 10000,
    location: { district: "Kalutara", city: "Beruwala" },
    clientId: "client-6",
    status: "open",
    createdAt: "2024-01-20T08:00:00Z",
    updatedAt: "2024-01-20T08:00:00Z",
  },
];

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com";

// Change to false when your backend is ready.
const USE_MOCK_DATA = true;

export const jobApi = createApi({
  reducerPath: "jobApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,

    prepareHeaders: (headers) => {
      // React Native does not have browser localStorage.
      // Add your AsyncStorage/secure token integration here.
      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),

  tagTypes: ["Job", "Jobs"],

  endpoints: (builder) => ({
    // ---------------------------------------------------------
    // GET ALL JOBS
    // ---------------------------------------------------------
    getJobs: builder.query<JobResponse, JobFilters>({
      queryFn: async (filters, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          let filtered = [...MOCK_JOBS];

          if (filters.category) {
            filtered = filtered.filter(
              (job) =>
                job.category.toLowerCase() === filters.category!.toLowerCase(),
            );
          }

          if (filters.district) {
            filtered = filtered.filter(
              (job) => job.location.district === filters.district,
            );
          }

          if (filters.city) {
            filtered = filtered.filter((job) =>
              job.location.city
                .toLowerCase()
                .includes(filters.city!.toLowerCase()),
            );
          }

          if (filters.search) {
            const search = filters.search.toLowerCase();

            filtered = filtered.filter(
              (job) =>
                job.title.toLowerCase().includes(search) ||
                job.description.toLowerCase().includes(search) ||
                job.category.toLowerCase().includes(search),
            );
          }

          if (filters.status) {
            filtered = filtered.filter((job) => job.status === filters.status);
          }

          if (filters.minBudget !== undefined) {
            filtered = filtered.filter(
              (job) => job.budget >= filters.minBudget!,
            );
          }

          if (filters.maxBudget !== undefined) {
            filtered = filtered.filter(
              (job) => job.budget <= filters.maxBudget!,
            );
          }

          if (filters.sortBy) {
            filtered.sort((a, b) => {
              const aValue = a[filters.sortBy! as keyof Job];
              const bValue = b[filters.sortBy! as keyof Job];

              if (typeof aValue === "string" && typeof bValue === "string") {
                return filters.sortOrder === "asc"
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue);
              }

              if (typeof aValue === "number" && typeof bValue === "number") {
                return filters.sortOrder === "asc"
                  ? aValue - bValue
                  : bValue - aValue;
              }

              return 0;
            });
          }

          const page = filters.page || 1;
          const limit = filters.limit || 10;
          const start = (page - 1) * limit;
          const end = start + limit;

          return {
            data: {
              jobs: filtered.slice(start, end),
              total: filtered.length,
              page,
              limit,
              totalPages: Math.ceil(filtered.length / limit),
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

        if (filters.status) {
          params.append("status", filters.status);
        }

        if (filters.minBudget !== undefined) {
          params.append("minBudget", filters.minBudget.toString());
        }

        if (filters.maxBudget !== undefined) {
          params.append("maxBudget", filters.maxBudget.toString());
        }

        if (filters.page !== undefined) {
          params.append("page", filters.page.toString());
        }

        if (filters.limit !== undefined) {
          params.append("limit", filters.limit.toString());
        }

        if (filters.sortBy) {
          params.append("sortBy", filters.sortBy);
        }

        if (filters.sortOrder) {
          params.append("sortOrder", filters.sortOrder);
        }

        const result = await baseQuery({
          url: `/jobs?${params.toString()}`,
          method: "GET",
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as JobResponse,
        };
      },

      providesTags: (result) =>
        result
          ? [
              ...result.jobs.map(({ id }) => ({
                type: "Job" as const,
                id,
              })),
              { type: "Jobs" as const, id: "LIST" },
            ]
          : [{ type: "Jobs" as const, id: "LIST" }],
    }),

    // ---------------------------------------------------------
    // GET RECENT JOBS
    // ---------------------------------------------------------
    getRecentJobs: builder.query<Job[], { limit?: number; district?: string }>({
      queryFn: async (
        { limit = 4, district },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        if (USE_MOCK_DATA) {
          let filtered = [...MOCK_JOBS];

          if (district) {
            filtered = filtered.filter(
              (job) => job.location.district === district,
            );
          }

          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          return {
            data: filtered.slice(0, limit),
          };
        }

        const params = new URLSearchParams();

        params.append("limit", limit.toString());
        params.append("sortBy", "createdAt");
        params.append("sortOrder", "desc");

        if (district) {
          params.append("district", district);
        }

        const result = await baseQuery({
          url: `/jobs/recent?${params.toString()}`,
          method: "GET",
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as Job[],
        };
      },

      providesTags: ["Jobs"],
    }),

    // ---------------------------------------------------------
    // GET JOB BY ID
    // ---------------------------------------------------------
    getJobById: builder.query<Job, string>({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const job = MOCK_JOBS.find((item) => item.id === id);

          if (!job) {
            return {
              error: {
                status: 404,
                data: "Job not found",
              },
            };
          }

          return { data: job };
        }

        const result = await baseQuery({
          url: `/jobs/${id}`,
          method: "GET",
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as Job,
        };
      },

      providesTags: (_result, _error, id) => [{ type: "Job", id }],
    }),

    // ---------------------------------------------------------
    // GET JOBS BY CATEGORY
    // ---------------------------------------------------------
    getJobsByCategory: builder.query<
      Job[],
      { category: string; limit?: number }
    >({
      queryFn: async (
        { category, limit = 10 },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        if (USE_MOCK_DATA) {
          const filtered = MOCK_JOBS.filter(
            (job) => job.category.toLowerCase() === category.toLowerCase(),
          );

          return {
            data: filtered.slice(0, limit),
          };
        }

        const params = new URLSearchParams();
        params.append("limit", limit.toString());

        const result = await baseQuery({
          url: `/jobs/category/${encodeURIComponent(category)}?${params.toString()}`,
          method: "GET",
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as Job[],
        };
      },

      providesTags: ["Jobs"],
    }),

    // ---------------------------------------------------------
    // CREATE JOB
    // ---------------------------------------------------------
    createJob: builder.mutation<Job, CreateJobDto>({
      queryFn: async (jobData, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const now = new Date().toISOString();

          const newJob: Job = {
            id: `job-${Date.now()}`,
            ...jobData,
            clientId: "client-new",
            status: "open",
            createdAt: now,
            updatedAt: now,
          };

          MOCK_JOBS.push(newJob);

          return {
            data: newJob,
          };
        }

        const result = await baseQuery({
          url: "/jobs",
          method: "POST",
          body: jobData,
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as Job,
        };
      },

      invalidatesTags: ["Jobs"],
    }),

    // ---------------------------------------------------------
    // UPDATE JOB
    // ---------------------------------------------------------
    updateJob: builder.mutation<Job, { id: string; data: UpdateJobDto }>({
      queryFn: async ({ id, data }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const index = MOCK_JOBS.findIndex((job) => job.id === id);

          if (index === -1) {
            return {
              error: {
                status: 404,
                data: "Job not found",
              },
            };
          }

          //   MOCK_JOBS[index] = {
          //     ...MOCK_JOBS[index],
          //     ...data,
          //     updatedAt: new Date().toISOString(),
          //   };

          return {
            data: MOCK_JOBS[index],
          };
        }

        const result = await baseQuery({
          url: `/jobs/${id}`,
          method: "PATCH",
          body: data,
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as Job,
        };
      },

      invalidatesTags: (_result, _error, { id }) => [
        { type: "Job", id },
        { type: "Jobs", id: "LIST" },
      ],
    }),

    // ---------------------------------------------------------
    // DELETE JOB
    // ---------------------------------------------------------
    deleteJob: builder.mutation<void, string>({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const index = MOCK_JOBS.findIndex((job) => job.id === id);

          if (index === -1) {
            return {
              error: {
                status: 404,
                data: "Job not found",
              },
            };
          }

          MOCK_JOBS.splice(index, 1);

          return {
            data: undefined,
          };
        }

        const result = await baseQuery({
          url: `/jobs/${id}`,
          method: "DELETE",
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: undefined,
        };
      },

      invalidatesTags: (_result, _error, id) => [
        { type: "Job", id },
        { type: "Jobs", id: "LIST" },
      ],
    }),

    // ---------------------------------------------------------
    // ASSIGN WORKER
    // ---------------------------------------------------------
    assignWorker: builder.mutation<Job, { jobId: string; workerId: string }>({
      queryFn: async ({ jobId, workerId }, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const index = MOCK_JOBS.findIndex((job) => job.id === jobId);

          if (index === -1) {
            return {
              error: {
                status: 404,
                data: "Job not found",
              },
            };
          }

          MOCK_JOBS[index] = {
            ...MOCK_JOBS[index],
            workerId,
            status: "assigned",
            updatedAt: new Date().toISOString(),
          };

          return {
            data: MOCK_JOBS[index],
          };
        }

        const result = await baseQuery({
          url: `/jobs/${jobId}/assign`,
          method: "POST",
          body: { workerId },
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as Job,
        };
      },

      invalidatesTags: (_result, _error, { jobId }) => [
        { type: "Job", id: jobId },
        { type: "Jobs", id: "LIST" },
      ],
    }),

    // ---------------------------------------------------------
    // COMPLETE JOB
    // ---------------------------------------------------------
    completeJob: builder.mutation<Job, string>({
      queryFn: async (jobId, _api, _extraOptions, baseQuery) => {
        if (USE_MOCK_DATA) {
          const index = MOCK_JOBS.findIndex((job) => job.id === jobId);

          if (index === -1) {
            return {
              error: {
                status: 404,
                data: "Job not found",
              },
            };
          }

          MOCK_JOBS[index] = {
            ...MOCK_JOBS[index],
            status: "completed",
            updatedAt: new Date().toISOString(),
          };

          return {
            data: MOCK_JOBS[index],
          };
        }

        const result = await baseQuery({
          url: `/jobs/${jobId}/complete`,
          method: "POST",
        });

        if (result.error) {
          return { error: result.error };
        }

        return {
          data: result.data as Job,
        };
      },

      invalidatesTags: (_result, _error, jobId) => [
        { type: "Job", id: jobId },
        { type: "Jobs", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetJobsQuery,
  useGetRecentJobsQuery,
  useGetJobByIdQuery,
  useGetJobsByCategoryQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useAssignWorkerMutation,
  useCompleteJobMutation,
} = jobApi;
