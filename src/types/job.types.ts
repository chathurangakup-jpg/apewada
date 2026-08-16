export interface Job {
  id: string;
  customerId: string;
  workerId?: string;
  title: string;
  description: string;
  category: string;
  status: JobStatus;
  budget: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  quotation?: Quotation;
  customer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  worker?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export enum JobStatus {
  OPEN = "open",
  QUOTING = "quoting",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Quotation {
  id: string;
  jobId: string;
  workerId: string;
  amount: number;
  description: string;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
  worker?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
}

export enum QuotationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface CreateJobDTO {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
}

export interface CreateQuotationDTO {
  jobId: string;
  amount: number;
  description: string;
}
