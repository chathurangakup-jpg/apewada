export type BookingRole = "CUSTOMER" | "WORKER";

export interface BookingPerson {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface Booking {
  id: string;
  customerId?: string;
  workerId?: string;
  jobId?: string | null;
  scheduledDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  status: string;
  cancellationReason?: string | null;
  jobTitle?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customer?: BookingPerson;
  worker?: BookingPerson;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  workerId: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  jobId?: string;
}

export interface RespondToBookingPayload {
  bookingId: string;
  decision: "ACCEPT" | "REJECT";
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateBookingStatusPayload {
  bookingId: string;
  status: "IN_PROGRESS" | "COMPLETED";
}

export interface ReviewBookingPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");

async function request<T>(
  token: string,
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(
      result?.message || `Request failed (${response.status}). Please try again.`,
    );
  }

  return result.data;
}

export async function getBookings(
  token: string,
  role: BookingRole,
): Promise<Booking[]> {
  const path =
    role === "CUSTOMER"
      ? "/api/customer/bookings"
      : "/api/worker/booking-requests";
  const data = await request<{ bookings?: Booking[]; requests?: Booking[] }>(
    token,
    path,
    "GET",
  );
  const bookings = role === "WORKER" ? data.requests : data.bookings;

  return (bookings ?? []).map((booking) => ({
    ...booking,
    customer: booking.customer ?? {
      id: booking.customerId,
      name: booking.customerName ?? undefined,
      phone: booking.customerPhone ?? undefined,
    },
  }));
}

export async function createBooking(
  token: string,
  payload: CreateBookingPayload,
): Promise<Booking> {
  const data = await request<{ booking?: Booking }>(
    token,
    "/api/customer/bookings",
    "POST",
    payload,
  );
  if (!data.booking) {
    throw new Error("The booking response did not include a booking.");
  }
  return data.booking;
}

export async function respondToBooking(
  token: string,
  { bookingId, ...payload }: RespondToBookingPayload,
): Promise<Booking> {
  const data = await request<{ booking?: Booking }>(
    token,
    `/api/worker/bookings/${encodeURIComponent(bookingId)}/respond`,
    "PATCH",
    payload,
  );
  if (!data.booking) throw new Error("The response did not include a booking.");
  return data.booking;
}

export async function updateBookingStatus(
  token: string,
  { bookingId, status }: UpdateBookingStatusPayload,
): Promise<Booking> {
  const data = await request<{ booking?: Booking }>(
    token,
    `/api/worker/bookings/${encodeURIComponent(bookingId)}/status`,
    "PATCH",
    { status },
  );
  if (!data.booking) throw new Error("The response did not include a booking.");
  return data.booking;
}

export async function reviewBooking(
  token: string,
  { bookingId, rating, comment }: ReviewBookingPayload,
): Promise<Booking> {
  const data = await request<{ booking?: Booking }>(
    token,
    `/api/customer/bookings/${encodeURIComponent(bookingId)}/review`,
    "POST",
    { rating, ...(comment ? { comment } : {}) },
  );
  if (!data.booking) throw new Error("The response did not include a booking.");
  return data.booking;
}

export async function cancelBooking(
  token: string,
  role: BookingRole,
  bookingId: string,
  reason: string,
): Promise<Booking> {
  const prefix = role === "CUSTOMER" ? "customer" : "worker";
  const data = await request<{ booking?: Booking }>(
    token,
    `/api/${prefix}/bookings/${encodeURIComponent(bookingId)}/cancel`,
    "PATCH",
    { reason },
  );
  if (!data.booking) throw new Error("The response did not include a booking.");
  return data.booking;
}
