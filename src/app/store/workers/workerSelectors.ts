// store/workers/workerSelectors.ts
import { RootState } from "../store";
import { Worker } from "./worker.types";

export const selectAllWorkers = (state: RootState) => {
  const result = state.workerApi.queries["getWorkers"]?.data;
  return result ? (result as any).workers : [];
};

export const selectFeaturedWorkers = (state: RootState) => {
  const result = state.workerApi.queries["getFeaturedWorkers"]?.data;
  return (result as Worker[]) || [];
};

export const selectWorkerById = (state: RootState, workerId: string) => {
  const result = state.workerApi.queries[`getWorkerById("${workerId}")`]?.data;
  return (result as Worker) || null;
};

export const selectIsLoadingWorkers = (state: RootState) => {
  return state.workerApi.queries["getWorkers"]?.status === "pending";
};

export const selectIsLoadingFeatured = (state: RootState) => {
  return state.workerApi.queries["getFeaturedWorkers"]?.status === "pending";
};

export const selectWorkersError = (state: RootState) => {
  return state.workerApi.queries["getWorkers"]?.error as Error | null;
};
