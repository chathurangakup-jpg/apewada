import { selectApiAuthUser } from "@/app/store/auth/authSelector";
import {
  selectCustomerBookings,
  selectBookingError,
  selectBookingNotification,
  selectBookingSubmitting,
  selectBookingsLoading,
  selectWorkerBookings,
} from "@/app/store/bookings/bookingSelector";
import { clearBookingNotification } from "@/app/store/bookings/bookingSlice";
import {
  cancelExistingBooking,
  changeBookingStatus,
  fetchBookings,
  respondBooking,
  submitBookingReview,
} from "@/app/store/bookings/bookingThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectCurrentUser } from "@/app/store/profile/profileSelector";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingsScreen() {
  const dispatch = useAppDispatch();
  const profileUser = useAppSelector(selectCurrentUser);
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const user = profileUser ?? apiAuthUser;
  const userRole = user?.role.toUpperCase();
  const role =
    userRole === "WORKER"
      ? "WORKER"
      : userRole === "CUSTOMER"
        ? "CUSTOMER"
        : null;
  const bookings = useAppSelector(
    role === "WORKER"
      ? selectWorkerBookings
      : selectCustomerBookings,
  );
  const visibleBookings = role ? bookings : [];
  const loading = useAppSelector(selectBookingsLoading);
  const submitting = useAppSelector(selectBookingSubmitting);
  const error = useAppSelector(selectBookingError);
  const notification = useAppSelector(selectBookingNotification);
  const [cancellationBookingId, setCancellationBookingId] = useState<
    string | null
  >(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (role) {
      void dispatch(fetchBookings(role));
    }
  }, [dispatch, role]);

  const onRefresh = async () => {
    if (!role) return;

    setRefreshing(true);
    try {
      await dispatch(fetchBookings(role));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!notification) return;
    Alert.alert("Booking", notification, [
      { text: "OK", onPress: () => dispatch(clearBookingNotification()) },
    ]);
  }, [dispatch, notification]);

  const closeCancellationModal = () => {
    if (submitting) return;
    setCancellationBookingId(null);
    setCancellationReason("");
  };

  const confirmCancellation = async () => {
    const reason = cancellationReason.trim();
    if (!role || !cancellationBookingId || !reason) {
      Alert.alert("Booking", "Enter a reason before cancelling.");
      return;
    }

    try {
      await dispatch(
        cancelExistingBooking({
          role,
          bookingId: cancellationBookingId,
          reason,
        }),
      ).unwrap();
      setCancellationBookingId(null);
      setCancellationReason("");
    } catch (cancelError) {
      Alert.alert(
        "Unable to cancel booking",
        typeof cancelError === "string"
          ? cancelError
          : "Please try again.",
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor="#FF6B35"
          colors={["#FF6B35"]}
        />
      }
    >
      <Text style={styles.title}>Bookings</Text>
      {!role && (
        <Text style={styles.empty}>
          Booking requests are available for customer and worker accounts.
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      {loading && visibleBookings.length === 0 ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : visibleBookings.length === 0 ? (
        <Text style={styles.empty}>No booking requests yet.</Text>
      ) : (
        visibleBookings.map((booking) => {
          const isPending = ["PENDING", "PENDING_CONFIRMATION"].includes(
            booking.status.toUpperCase(),
          );
          const isAccepted = ["ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(
            booking.status.toUpperCase(),
          );
          return (
            <View key={booking.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {role === "WORKER"
                  ? booking.customer?.name || "Customer"
                  : booking.worker?.name || "Worker"}
              </Text>
              {role === "WORKER" && booking.customer?.phone && (
                <Text style={styles.detail}>
                  Phone: {booking.customer.phone}
                </Text>
              )}
              {role === "CUSTOMER" && booking.worker?.phone && (
                <Text style={styles.detail}>
                  Phone: {booking.worker.phone}
                </Text>
              )}
              {booking.jobTitle && (
                <Text style={styles.detail}>Job: {booking.jobTitle}</Text>
              )}
              <Text style={styles.detail}>Status: {booking.status}</Text>
              <Text style={styles.detail}>
                Date: {formatBookingDate(booking.scheduledDate)}
              </Text>
              <Text style={styles.detail}>
                Time: {formatBookingTime(booking.startTime)} -{" "}
                {formatBookingTime(booking.endTime)}
              </Text>
              {booking.confirmedAt && (
                <Text style={styles.detail}>
                  Confirmed: {formatBookingDate(booking.confirmedAt)}
                </Text>
              )}
              {["ACCEPTED", "CONFIRMED", "SCHEDULED", "IN_PROGRESS"].includes(
                booking.status.toUpperCase(),
              ) && (
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    setCancellationReason("");
                    setCancellationBookingId(booking.id);
                  }}
                >
                  <Text style={styles.rejectText}>Cancel booking</Text>
                </TouchableOpacity>
              )}
              {role === "WORKER" && isPending && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() =>
                      void dispatch(
                        respondBooking({
                          bookingId: booking.id,
                          decision: "ACCEPT",
                          scheduledDate: booking.scheduledDate?.slice(0, 10),
                          startTime: booking.startTime || "09:00",
                          endTime: booking.endTime || "11:00",
                        }),
                      )
                    }
                  >
                    <Text style={styles.primaryText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() =>
                      void dispatch(
                        respondBooking({
                          bookingId: booking.id,
                          decision: "REJECT",
                        }),
                      )
                    }
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              {role === "WORKER" && isAccepted && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    void dispatch(
                      changeBookingStatus({
                        bookingId: booking.id,
                        status: "IN_PROGRESS",
                      }),
                    )
                  }
                >
                  <Text style={styles.primaryText}>Mark in progress</Text>
                </TouchableOpacity>
              )}
              {role === "WORKER" &&
                booking.status.toUpperCase() === "IN_PROGRESS" && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() =>
                      void dispatch(
                        changeBookingStatus({
                          bookingId: booking.id,
                          status: "COMPLETED",
                        }),
                      )
                    }
                  >
                    <Text style={styles.primaryText}>Mark completed</Text>
                  </TouchableOpacity>
                )}
              {role === "CUSTOMER" &&
                booking.status.toUpperCase() === "COMPLETED" &&
                booking.jobId && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setReviewBookingId(booking.id)}
                  >
                    <Text style={styles.primaryText}>Review worker</Text>
                  </TouchableOpacity>
                )}
            </View>
          );
        })
      )}
      {reviewBookingId && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Review worker</Text>
          <TextInput
            value={rating}
            onChangeText={setRating}
            keyboardType="number-pad"
            placeholder="Rating (1-5)"
            style={styles.input}
          />
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Comment (optional)"
            multiline
            style={[styles.input, styles.comment]}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              const value = Number(rating);
              if (!Number.isInteger(value) || value < 1 || value > 5) {
                Alert.alert(
                  "Review",
                  "Rating must be a whole number from 1 to 5.",
                );
                return;
              }
              void dispatch(
                submitBookingReview({
                  bookingId: reviewBookingId,
                  rating: value,
                  comment: comment.trim() || undefined,
                }),
              );
              setReviewBookingId(null);
            }}
          >
            <Text style={styles.primaryText}>Submit review</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={cancellationBookingId !== null}
        transparent
        animationType="fade"
        onRequestClose={closeCancellationModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Cancel booking</Text>
            <Text style={styles.detail}>
              Please tell us why you need to cancel this booking.
            </Text>
            <TextInput
              value={cancellationReason}
              onChangeText={setCancellationReason}
              placeholder="Enter cancellation reason"
              multiline
              editable={!submitting}
              style={[styles.input, styles.comment]}
              textAlignVertical="top"
            />
            <View style={styles.actions}>
              <TouchableOpacity
                disabled={submitting}
                style={styles.rejectButton}
                onPress={closeCancellationModal}
              >
                <Text style={styles.rejectText}>Keep booking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={submitting || !cancellationReason.trim()}
                style={[
                  styles.primaryButton,
                  (submitting || !cancellationReason.trim()) &&
                    styles.disabledButton,
                ]}
                onPress={() => void confirmCancellation()}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryText}>Confirm cancellation</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#F8FAFC", flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "700", color: "#111827" },
  card: {
    padding: 16,
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  detail: { color: "#4B5563" },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  comment: { height: 92, paddingTop: 12, textAlignVertical: "top" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
  },
  modalCard: {
    padding: 20,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  primaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#FF6B35",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "700" },
  disabledButton: { opacity: 0.55 },
  rejectButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  rejectText: { color: "#DC2626", fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  empty: { textAlign: "center", color: "#6B7280", marginTop: 32 },
  error: { color: "#B91C1C", textAlign: "center" },
});

function formatBookingDate(value?: string) {
  if (!value) return "Not set";

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatBookingTime(value?: string | null) {
  return value ? value.slice(0, 5) : "—";
}
