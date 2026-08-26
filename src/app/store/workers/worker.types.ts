// store/workers/worker.types.ts
export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: string;
}

export interface Location {
  district: string;
  city: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Availability {
  status: "available" | "busy" | "unavailable";
  schedule?: string[];
}

export interface Worker {
  id: string;
  userId: string;
  user: User;
  profession: string;
  category: string;
  rating: number;
  totalJobs: number;
  verified: boolean;
  location: Location;
  services: Service[];
  experience?: number;
  availability?: Availability;
  hourlyRate?: number;
  description?: string;
  portfolio?: string[];
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkerResponse {
  workers: Worker[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkerFilters {
  category?: string;
  district?: string;
  city?: string;
  search?: string;
  rating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateWorkerDto {
  userId: string;
  profession: string;
  category: string;
  location: Location;
  services: Service[];
  hourlyRate?: number;
  description?: string;
  experience?: number;
}

export interface UpdateWorkerDto extends Partial<CreateWorkerDto> {
  verified?: boolean;
  rating?: number;
  totalJobs?: number;
  availability?: Availability;
}
