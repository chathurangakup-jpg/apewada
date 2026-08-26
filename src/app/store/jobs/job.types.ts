// store/jobs/job.types.ts
export interface JobLocation {
  district: string;
  city: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: JobLocation;
  workerId?: string;
  clientId: string;
  status: "open" | "assigned" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  attachments?: string[];
  requiredSkills?: string[];
  estimatedDuration?: string;
  paymentStatus?: "pending" | "paid" | "refunded";
}

export interface JobResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobFilters {
  category?: string;
  district?: string;
  city?: string;
  search?: string;
  status?: Job["status"];
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "budget" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateJobDto {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: JobLocation;
  deadline?: string;
  requiredSkills?: string[];
  estimatedDuration?: string;
  attachments?: string[];
}

export interface UpdateJobDto extends Partial<CreateJobDto> {
  status?: Job["status"];
  workerId?: string | null;
  paymentStatus?: Job["paymentStatus"];
}
