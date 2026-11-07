import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSavedSessionToken } from "../profile/profileServices";
import {
  Booking,
  BookingRole,
  cancelBooking,
  createBooking,
  CreateBookingPayload,
  getBookings,
  respondToBooking,
  RespondToBookingPayload,
  reviewBooking,
  ReviewBookingPayload,
  updateBookingStatus,
  UpdateBookingStatusPayload,
} from "./bookingServices";

type ApiAuthState = { apiAuth?: { token?: string | null } };

async function requireToken(getState: () => unknown) {
  const token =
    (getState() as ApiAuthState).apiAuth?.token ??
    (await getSavedSessionToken());
  if (!token) throw new Error("Your session has expired. Please log in again.");
  return token;
}

const rejectMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const fetchBookings = createAsyncThunk<
  { role: BookingRole; bookings: Booking[] },
  BookingRole,
  { rejectValue: string }
>("bookings/fetch", async (role, { getState, rejectWithValue }) => {
  try {
    return { role, bookings: await getBookings(await requireToken(getState), role) };
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Unable to load bookings"));
  }
});

export const submitBooking = createAsyncThunk<
  Booking,
  CreateBookingPayload,
  { rejectValue: string }
>("bookings/create", async (payload, { getState, rejectWithValue }) => {
  try {
    return await createBooking(await requireToken(getState), payload);
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Unable to create booking"));
  }
});

export const respondBooking = createAsyncThunk<
  Booking,
  RespondToBookingPayload,
  { rejectValue: string }
>("bookings/respond", async (payload, { getState, rejectWithValue }) => {
  try {
    return await respondToBooking(await requireToken(getState), payload);
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Unable to respond to booking"));
  }
});

export const changeBookingStatus = createAsyncThunk<
  Booking,
  UpdateBookingStatusPayload,
  { rejectValue: string }
>("bookings/changeStatus", async (payload, { getState, rejectWithValue }) => {
  try {
    return await updateBookingStatus(await requireToken(getState), payload);
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Unable to update booking"));
  }
});

export const submitBookingReview = createAsyncThunk<
  Booking,
  ReviewBookingPayload,
  { rejectValue: string }
>("bookings/review", async (payload, { getState, rejectWithValue }) => {
  try {
    return await reviewBooking(await requireToken(getState), payload);
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Unable to submit review"));
  }
});

export const cancelExistingBooking = createAsyncThunk<
  Booking,
  { role: BookingRole; bookingId: string; reason: string },
  { rejectValue: string }
>("bookings/cancel", async ({ role, bookingId, reason }, { getState, rejectWithValue }) => {
  try {
    return await cancelBooking(await requireToken(getState), role, bookingId, reason);
  } catch (error) {
    return rejectWithValue(rejectMessage(error, "Unable to cancel booking"));
  }
});
