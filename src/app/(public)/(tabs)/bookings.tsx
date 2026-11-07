import {
  selectBookingError,
  selectBookingNotification,
  selectBookingSubmitting,
  selectBookingsLoading,
  selectCustomerBookings,
  selectWorkerBookings,
} from "@/app/store/bookings/bookingSelector";
import { clearBookingNotification } from "@/app/store/bookings/bookingSlice";
import {
  cancelExistingBooking,
  changeBookingStatus,
  fetchBookings,
  respondBooking,
  submitBooking,
  submitBookingReview,
} from "@/app/store/bookings/bookingThunk";
import { selectApiAuthUser } from "@/app/store/auth/authSelector";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectCurrentUser } from "@/app/store/profile/profileSelector";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingsScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ workerId?: string; workerName?: string }>();
  const profileUser = useAppSelector(selectCurrentUser);
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const user = profileUser ?? apiAuthUser;
  const role = user?.role.toUpperCase() === "WORKER" ? "WORKER" : "CUSTOMER";
  const bookings = useAppSelector(
    role === "WORKER" ? selectWorkerBookings : selectCustomerBookings,
  );
  const loading = useAppSelector(selectBookingsLoading);
  const submitting = useAppSelector(selectBookingSubmitting);
  const error = useAppSelector(selectBookingError);
  const notification = useAppSelector(selectBookingNotification);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date(0, 0, 0, 9));
  const [endTime, setEndTime] = useState(new Date(0, 0, 0, 11));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedHalf, setSelectedHalf] = useState<"MORNING" | "EVENING" | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState("");
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    void dispatch(fetchBookings(role));
  }, [dispatch, role]);

  useEffect(() => {
    if (!notification) return;
    Alert.alert("Booking", notification, [
      { text: "OK", onPress: () => dispatch(clearBookingNotification()) },
    ]);
  }, [dispatch, notification]);

  const createRequest = () => {
    if (!params.workerId) {
      Alert.alert("Booking", "Select a worker before requesting a booking.");
      return;
    }
    void dispatch(
      submitBooking({
        workerId: params.workerId,
        scheduledDate: formatDate(date),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      }),
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      {role === "CUSTOMER" && params.workerId && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Book {params.workerName || "worker"}</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerText}>Date: {formatDate(date)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
          <Text style={styles.label}>Preferred time</Text>
          <View style={styles.halfDayOptions}>
            <TouchableOpacity
              style={[styles.checkboxRow, selectedHalf === "MORNING" && styles.checkboxRowSelected]}
              onPress={() => {
                setSelectedHalf("MORNING");
                setStartTime(new Date(0, 0, 0, 8));
                setEndTime(new Date(0, 0, 0, 12));
              }}
            >
              <View style={[styles.checkbox, selectedHalf === "MORNING" && styles.checkboxSelected]} />
              <Text>Morning half (08:00 - 12:00)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkboxRow, selectedHalf === "EVENING" && styles.checkboxRowSelected]}
              onPress={() => {
                setSelectedHalf("EVENING");
                setStartTime(new Date(0, 0, 0, 13));
                setEndTime(new Date(0, 0, 0, 17));
              }}
            >
              <View style={[styles.checkbox, selectedHalf === "EVENING" && styles.checkboxSelected]} />
              <Text>Evening half (13:00 - 17:00)</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.customTimeButton}
            onPress={() => setSelectedHalf(null)}
          >
            <Text style={styles.customTimeText}>Choose custom times</Text>
          </TouchableOpacity>
          {!selectedHalf && (
            <>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStartTimePicker(true)}>
                <Text style={styles.pickerText}>Start time: {formatTime(startTime)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowEndTimePicker(true)}>
                <Text style={styles.pickerText}>End time: {formatTime(endTime)}</Text>
              </TouchableOpacity>
              {showStartTimePicker && <DateTimePicker value={startTime} mode="time" onChange={(_, value) => { setShowStartTimePicker(false); if (value) setStartTime(value); }} />}
              {showEndTimePicker && <DateTimePicker value={endTime} mode="time" onChange={(_, value) => { setShowEndTimePicker(false); if (value) setEndTime(value); }} />}
            </>
          )}
          <TouchableOpacity disabled={submitting} style={styles.primaryButton} onPress={createRequest}>
            <Text style={styles.primaryText}>{submitting ? "Sending..." : "Request booking"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cancellation reason</Text>
        <TextInput value={cancellationReason} onChangeText={setCancellationReason} placeholder="Reason required to cancel a confirmed booking" style={styles.input} />
      </View>
      {loading ? <ActivityIndicator size="large" color="#FF6B35" /> : bookings.length === 0 ? (
        <Text style={styles.empty}>No booking requests yet.</Text>
      ) : bookings.map((booking) => {
        const isPending = ["PENDING", "PENDING_CONFIRMATION"].includes(
          booking.status.toUpperCase(),
        );
        const isAccepted = ["ACCEPTED", "CONFIRMED", "SCHEDULED"].includes(booking.status.toUpperCase());
        return (
          <View key={booking.id} style={styles.card}>
            <Text style={styles.cardTitle}>{role === "WORKER" ? booking.customer?.name || "Customer" : booking.worker?.name || "Worker"}</Text>
            {role === "WORKER" && booking.customer?.phone && (
              <Text style={styles.detail}>Phone: {booking.customer.phone}</Text>
            )}
            {booking.jobTitle && (
              <Text style={styles.detail}>Job: {booking.jobTitle}</Text>
            )}
            <Text style={styles.detail}>Status: {booking.status}</Text>
            <Text style={styles.detail}>Date: {booking.scheduledDate?.slice(0, 10) || "Not set"}</Text>
            <Text style={styles.detail}>Time: {booking.startTime || "—"} - {booking.endTime || "—"}</Text>
            {["ACCEPTED", "CONFIRMED", "SCHEDULED", "IN_PROGRESS"].includes(booking.status.toUpperCase()) && (
              <TouchableOpacity style={styles.rejectButton} onPress={() => {
                if (!cancellationReason.trim()) {
                  Alert.alert("Booking", "Enter a cancellation reason first.");
                  return;
                }
                void dispatch(cancelExistingBooking({ role, bookingId: booking.id, reason: cancellationReason.trim() }));
              }}>
                <Text style={styles.rejectText}>Cancel booking</Text>
              </TouchableOpacity>
            )}
            {role === "WORKER" && isPending && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => void dispatch(respondBooking({ bookingId: booking.id, decision: "ACCEPT", scheduledDate: booking.scheduledDate, startTime: booking.startTime || "09:00", endTime: booking.endTime || "11:00" }))}>
                  <Text style={styles.primaryText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => void dispatch(respondBooking({ bookingId: booking.id, decision: "REJECT" }))}>
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            {role === "WORKER" && isAccepted && (
              <TouchableOpacity style={styles.primaryButton} onPress={() => void dispatch(changeBookingStatus({ bookingId: booking.id, status: "IN_PROGRESS" }))}>
                <Text style={styles.primaryText}>Mark in progress</Text>
              </TouchableOpacity>
            )}
            {role === "WORKER" && booking.status.toUpperCase() === "IN_PROGRESS" && (
              <TouchableOpacity style={styles.primaryButton} onPress={() => void dispatch(changeBookingStatus({ bookingId: booking.id, status: "COMPLETED" }))}>
                <Text style={styles.primaryText}>Mark completed</Text>
              </TouchableOpacity>
            )}
            {role === "CUSTOMER" && booking.status.toUpperCase() === "COMPLETED" && booking.jobId && (
              <TouchableOpacity style={styles.primaryButton} onPress={() => setReviewBookingId(booking.id)}>
                <Text style={styles.primaryText}>Review worker</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      {reviewBookingId && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Review worker</Text>
          <TextInput value={rating} onChangeText={setRating} keyboardType="number-pad" placeholder="Rating (1-5)" style={styles.input} />
          <TextInput value={comment} onChangeText={setComment} placeholder="Comment (optional)" multiline style={[styles.input, styles.comment]} />
          <TouchableOpacity style={styles.primaryButton} onPress={() => {
            const value = Number(rating);
            if (!Number.isInteger(value) || value < 1 || value > 5) {
              Alert.alert("Review", "Rating must be a whole number from 1 to 5.");
              return;
            }
            void dispatch(submitBookingReview({ bookingId: reviewBookingId, rating: value, comment: comment.trim() || undefined }));
            setReviewBookingId(null);
          }}>
            <Text style={styles.primaryText}>Submit review</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, backgroundColor: "#F8FAFC", flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "700", color: "#111827" },
  card: { padding: 16, gap: 8, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  detail: { color: "#4B5563" },
  input: { height: 46, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, paddingHorizontal: 12, backgroundColor: "#FFFFFF" },
  comment: { height: 92, paddingTop: 12, textAlignVertical: "top" },
  primaryButton: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, borderRadius: 8, backgroundColor: "#FF6B35" },
  primaryText: { color: "#FFFFFF", fontWeight: "700" },
  rejectButton: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: "#EF4444" },
  rejectText: { color: "#DC2626", fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  empty: { textAlign: "center", color: "#6B7280", marginTop: 32 },
  error: { color: "#B91C1C", textAlign: "center" },
  label: { fontWeight: "600", color: "#374151" },
  pickerButton: { minHeight: 46, justifyContent: "center", paddingHorizontal: 12, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8 },
  pickerText: { color: "#374151" },
  halfDayOptions: { gap: 8 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8 },
  checkboxRowSelected: { borderColor: "#FF6B35", backgroundColor: "#FFF5F0" },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: "#9CA3AF", borderRadius: 3 },
  checkboxSelected: { borderColor: "#FF6B35", borderWidth: 5 },
  customTimeButton: { alignSelf: "flex-start" },
  customTimeText: { color: "#FF6B35", fontWeight: "600" },
});

function formatDate(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

function formatTime(value: Date) {
  return value.toTimeString().slice(0, 5);
}
