import { createSlice } from "@reduxjs/toolkit";
import { Booking } from "./bookingServices";
import {
  cancelExistingBooking,
  changeBookingStatus,
  fetchBookings,
  respondBooking,
  submitBooking,
  submitBookingReview,
} from "./bookingThunk";

interface BookingState {
  customerBookings: Booking[];
  workerBookings: Booking[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  notification: string | null;
}

const initialState: BookingState = {
  customerBookings: [],
  workerBookings: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  notification: null,
};

function replaceBooking(bookings: Booking[], booking: Booking) {
  const index = bookings.findIndex((item) => item.id === booking.id);
  if (index >= 0) bookings[index] = booking;
  else bookings.unshift(booking);
}

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearBookingNotification(state) {
      state.notification = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.role === "CUSTOMER") state.customerBookings = action.payload.bookings;
        else state.workerBookings = action.payload.bookings;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? "Unable to load bookings";
      });

    [submitBooking, respondBooking, changeBookingStatus, submitBookingReview, cancelExistingBooking].forEach(
      (thunk) => {
        builder.addCase(thunk.pending, (state) => {
          state.isSubmitting = true;
          state.error = null;
        });
        builder.addCase(thunk.fulfilled, (state, action) => {
          state.isSubmitting = false;
          replaceBooking(state.customerBookings, action.payload);
          replaceBooking(state.workerBookings, action.payload);
          state.notification = "Booking updated successfully.";
        });
        builder.addCase(thunk.rejected, (state, action) => {
          state.isSubmitting = false;
          state.error = action.payload ?? action.error.message ?? "Unable to update booking";
        });
      },
    );
  },
});

export const { clearBookingNotification } = bookingSlice.actions;
export default bookingSlice.reducer;
