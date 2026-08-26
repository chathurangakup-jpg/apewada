// store/users/userTypes.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "worker" | "customer" | "admin";
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  user: User;
  savedWorkers?: string[];
  savedJobs?: string[];
  address?: {
    street: string;
    city: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  preferences?: {
    categories?: string[];
    notifications?: boolean;
    language?: string;
  };
  totalJobsPosted?: number;
  totalSpent?: number;
  averageRating?: number;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  user: User;
  profession: string;
  category: string;
  rating: number;
  totalJobs: number;
  verified: boolean;
  location: {
    district: string;
    city: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  services: Array<{
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: string;
  }>;
  experience?: number;
  availability?: {
    status: "available" | "busy" | "unavailable";
    schedule?: string[];
  };
  hourlyRate?: number;
  description?: string;
  portfolio?: string[];
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  customerProfile: CustomerProfile | null;
  workerProfile: WorkerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "worker" | "customer";
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  avatar?: string;
  email?: string;
}

export interface UpdateCustomerDto {
  address?: CustomerProfile["address"];
  preferences?: CustomerProfile["preferences"];
  savedWorkers?: string[];
  savedJobs?: string[];
}

export interface UpdateWorkerDto {
  profession?: string;
  category?: string;
  location?: WorkerProfile["location"];
  services?: WorkerProfile["services"];
  experience?: number;
  availability?: WorkerProfile["availability"];
  hourlyRate?: number;
  description?: string;
  portfolio?: string[];
  skills?: string[];
  certifications?: string[];
  languages?: string[];
}
