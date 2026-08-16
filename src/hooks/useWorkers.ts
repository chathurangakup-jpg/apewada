import { useQuery } from "@tanstack/react-query";
import { mockWorkers } from "../services/mockData";
import { Worker, WorkerSearchFilters } from "../types";

const fetchWorkers = async (
  filters?: WorkerSearchFilters,
): Promise<Worker[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let workers = [...mockWorkers];

  if (filters?.profession) {
    workers = workers.filter((w) =>
      w.profession.toLowerCase().includes(filters.profession!.toLowerCase()),
    );
  }

  if (filters?.location) {
    workers = workers.filter((w) =>
      w.location.toLowerCase().includes(filters.location!.toLowerCase()),
    );
  }

  if (filters?.minRating) {
    workers = workers.filter((w) => w.rating >= filters.minRating!);
  }

  if (filters?.verified !== undefined) {
    workers = workers.filter((w) => w.verified === filters.verified);
  }

  if (filters?.services?.length) {
    workers = workers.filter((w) =>
      w.services.some((s) => filters.services!.includes(s.name)),
    );
  }

  return workers;
};

const fetchWorkerById = async (id: string): Promise<Worker> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const worker = mockWorkers.find((w) => w.id === id);
  if (!worker) throw new Error("Worker not found");
  return worker;
};

export const useWorkers = (filters?: WorkerSearchFilters) => {
  return useQuery({
    queryKey: ["workers", filters],
    queryFn: () => fetchWorkers(filters),
  });
};

export const useWorker = (id: string) => {
  return useQuery({
    queryKey: ["worker", id],
    queryFn: () => fetchWorkerById(id),
    enabled: !!id,
  });
};
