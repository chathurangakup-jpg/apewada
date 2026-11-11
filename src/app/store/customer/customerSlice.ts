import { createSlice } from "@reduxjs/toolkit";
import { Booking } from "../bookings/bookingServices";
import {
  cancelExistingBooking,
  changeBookingStatus,
  respondBooking,
  submitBooking,
  submitBookingReview,
} from "../bookings/bookingThunk";
import { CustomerJob } from "./customerServices";
import {
  editCustomerJob,
  fetchCustomerBookings,
  fetchCustomerJobs,
  submitCustomerJob,
} from "./customerThunk";

interface CustomerState {
  postedJobs: CustomerJob[];
  bookingRequests: Booking[];
  isLoadingJobs: boolean;
  isLoadingBookings: boolean;
  jobsError: string | null;
  bookingsError: string | null;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  postedJobs: [],
  bookingRequests: [],
  isLoadingJobs: false,
  isLoadingBookings: false,
  jobsError: null,
  bookingsError: null,
  isSubmitting: false,
  error: null,
};

function upsertBookingRequest(bookings: Booking[], booking: Booking) {
  const index = bookings.findIndex((item) => item.id === booking.id);
  if (index >= 0) bookings[index] = booking;
  else bookings.unshift(booking);
}

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerJobs.pending, (state) => {
        state.isLoadingJobs = true;
        state.jobsError = null;
      })
      .addCase(fetchCustomerJobs.fulfilled, (state, action) => {
        state.isLoadingJobs = false;
        state.postedJobs = action.payload;
      })
      .addCase(fetchCustomerJobs.rejected, (state, action) => {
        state.isLoadingJobs = false;
        state.jobsError =
          action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(submitCustomerJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitCustomerJob.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.postedJobs.unshift(action.payload);
      })
      .addCase(submitCustomerJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(editCustomerJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(editCustomerJob.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.postedJobs.findIndex(
          (job) => job.id === action.payload.id,
        );
        if (index >= 0) {
          state.postedJobs[index] = action.payload;
        } else {
          state.postedJobs.unshift(action.payload);
        }
      })
      .addCase(editCustomerJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? action.error.message ?? "Request failed";
      })
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.isLoadingBookings = true;
        state.bookingsError = null;
        state.bookingRequests = [];
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.isLoadingBookings = false;
        state.bookingRequests = action.payload;
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.isLoadingBookings = false;
        state.bookingsError =
          action.payload ??
          action.error.message ??
          "Unable to load your booking requests";
      })
      .addCase(submitBooking.fulfilled, (state, action) => {
        upsertBookingRequest(state.bookingRequests, action.payload);
      })
      .addCase(respondBooking.fulfilled, (state, action) => {
        upsertBookingRequest(state.bookingRequests, action.payload);
      })
      .addCase(changeBookingStatus.fulfilled, (state, action) => {
        upsertBookingRequest(state.bookingRequests, action.payload);
      })
      .addCase(submitBookingReview.fulfilled, (state, action) => {
        upsertBookingRequest(state.bookingRequests, action.payload);
      })
      .addCase(cancelExistingBooking.fulfilled, (state, action) => {
        upsertBookingRequest(state.bookingRequests, action.payload);
      });
  },
});

export default customerSlice.reducer;
