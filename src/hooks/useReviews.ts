import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockReviews } from "../services/mockData";
import { CreateReviewDTO, Review } from "../types";

const fetchReviewsByWorker = async (workerId: string): Promise<Review[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockReviews.filter((r) => r.workerId === workerId);
};

const fetchReviewsByCustomer = async (
  customerId: string,
): Promise<Review[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockReviews.filter((r) => r.customerId === customerId);
};

export const useReviewsByWorker = (workerId: string) => {
  return useQuery({
    queryKey: ["reviews", "worker", workerId],
    queryFn: () => fetchReviewsByWorker(workerId),
    enabled: !!workerId,
  });
};

export const useReviewsByCustomer = (customerId: string) => {
  return useQuery({
    queryKey: ["reviews", "customer", customerId],
    queryFn: () => fetchReviewsByCustomer(customerId),
    enabled: !!customerId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewDTO): Promise<Review> => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newReview: Review = {
        id: "r" + (mockReviews.length + 1),
        customerId: data.customerId || "u1",
        workerId: data.workerId,
        jobId: data.jobId,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockReviews.push(newReview);
      return newReview;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "worker", variables.workerId],
      });
    },
  });
};
