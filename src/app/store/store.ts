// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import apiAuthReducer from "./auth/authSlice";
import homeReducer from "./home/homeSlice";
import { jobApi } from "./jobs/jobApi";
import authReducer from "./users/userSlices";
import { workerApi } from "./workers/workerApi";

export const store = configureStore({
  reducer: {
    apiAuth: apiAuthReducer,
    home: homeReducer,
    auth: authReducer,
    [workerApi.reducerPath]: workerApi.reducer,
    [jobApi.reducerPath]: jobApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(workerApi.middleware)
      .concat(jobApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
