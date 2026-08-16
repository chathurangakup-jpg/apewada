export interface Customer {
  id: string;
  userId: string;
  address?: string;
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

export interface Review {
  id: string;
  customerId: string;
  workerId: string;
  jobId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateReviewDTO {
  workerId: string;
  jobId: string;
  rating: number;
  comment: string;
}
