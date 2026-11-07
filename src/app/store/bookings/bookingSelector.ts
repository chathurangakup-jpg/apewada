import { RootState } from "../store";

export const selectCustomerBookings = (state: RootState) =>
  state.bookings.customerBookings;
export const selectWorkerBookings = (state: RootState) =>
  state.bookings.workerBookings;
export const selectBookingsLoading = (state: RootState) => state.bookings.isLoading;
export const selectBookingSubmitting = (state: RootState) =>
  state.bookings.isSubmitting;
export const selectBookingError = (state: RootState) => state.bookings.error;
export const selectBookingNotification = (state: RootState) =>
  state.bookings.notification;
