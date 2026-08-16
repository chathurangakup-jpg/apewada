import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockJobs } from "../services/mockData";
import { CreateJobDTO, CreateQuotationDTO, Job } from "../types";

const fetchJobs = async (filters?: any): Promise<Job[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let jobs = [...mockJobs];

  if (filters?.status) {
    jobs = jobs.filter((j) => j.status === filters.status);
  }

  if (filters?.customerId) {
    jobs = jobs.filter((j) => j.customerId === filters.customerId);
  }

  if (filters?.workerId) {
    jobs = jobs.filter((j) => j.workerId === filters.workerId);
  }

  return jobs;
};

const fetchJobById = async (id: string): Promise<Job> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const job = mockJobs.find((j) => j.id === id);
  if (!job) throw new Error("Job not found");
  return job;
};

export const useJobs = (filters?: any) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJobById(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobDTO): Promise<Job> => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newJob: Job = {
        id: "j" + (mockJobs.length + 1),
        customerId: "u1", // Should come from auth context
        title: data.title,
        description: data.description,
        category: data.category,
        status: "open",
        budget: data.budget,
        location: data.location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockJobs.push(newJob);
      return newJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuotationDTO): Promise<Job> => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const job = mockJobs.find((j) => j.id === data.jobId);
      if (!job) throw new Error("Job not found");

      job.quotation = {
        id: "q" + (mockJobs.length + 1),
        jobId: data.jobId,
        workerId: "w1", // Should come from auth context
        amount: data.amount,
        description: data.description,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      job.status = "quoting";

      return job;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["job", data.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};
