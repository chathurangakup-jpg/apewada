// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import apiAuthReducer from "./auth/authSlice";
import bookingReducer from "./bookings/bookingSlice";
import conversationReducer from "./conversations/conversationSlice";
import customerReducer from "./customer/customerSlice";
import homeReducer from "./home/homeSlice";
import { jobApi } from "./jobs/jobApi";
import profileReducer from "./profile/profileSlice";
import authReducer from "./users/userSlices";
import { workerApi } from "./workers/workerApi";

export const store = configureStore({
  reducer: {
    apiAuth: apiAuthReducer,
    bookings: bookingReducer,
    conversations: conversationReducer,
    customer: customerReducer,
    home: homeReducer,
    profile: profileReducer,
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
