export * from "./customer.types";
export * from "./job.types";
export * from "./user.types";
export * from "./worker.types";

export enum UserRole {
  CUSTOMER = "customer",
  WORKER = "worker",
  ADMIN = "admin",
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  filter?: Record<string, any>;
}
