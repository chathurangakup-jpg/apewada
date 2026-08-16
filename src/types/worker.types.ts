export interface Worker {
  id: string;
  userId: string;
  profession: string;
  experience: number;
  location: string;
  verified: boolean;
  rating: number;
  totalJobs: number;
  services: Service[];
  portfolio: PortfolioItem[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  workerId: string;
  name: string;
  description?: string;
  price?: number;
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  workerId: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
}

export interface WorkerSearchFilters {
  profession?: string;
  location?: string;
  minRating?: number;
  maxBudget?: number;
  verified?: boolean;
  services?: string[];
}
