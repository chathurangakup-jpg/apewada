import {
  selectBookingError,
  selectBookingSubmitting,
} from "@/app/store/bookings/bookingSelector";
import { submitBooking } from "@/app/store/bookings/bookingThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import Header from "@/components/Splash/commonComponents/Header";
import ProfileDatePicker from "@/components/ProfileDatePicker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function getTodayDateString() {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function BookingRequestScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useLocalSearchParams<{
    workerId?: string | string[];
    workerName?: string | string[];
    jobId?: string | string[];
    jobTitle?: string | string[];
  }>();
  const workerId = Array.isArray(params.workerId)
    ? params.workerId[0]
    : params.workerId;
  const workerName = Array.isArray(params.workerName)
    ? params.workerName[0]
    : params.workerName;
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const jobTitle = Array.isArray(params.jobTitle)
    ? params.jobTitle[0]
    : params.jobTitle;
  const submitting = useAppSelector(selectBookingSubmitting);
  const requestError = useAppSelector(selectBookingError);
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [validationError, setValidationError] = useState<string | null>(null);

  const sendRequest = async () => {
    if (!workerId) {
      setValidationError("Worker information is missing. Return and select a worker.");
      return;
    }
    if (!scheduledDate) {
      setValidationError("Select your preferred date.");
      return;
    }
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      setValidationError("Enter times using 24-hour HH:MM format.");
      return;
    }
    if (startTime >= endTime) {
      setValidationError("End time must be later than start time.");
      return;
    }

    setValidationError(null);
    try {
      await dispatch(
        submitBooking({
          workerId,
          ...(jobId ? { jobId } : {}),
          scheduledDate,
          startTime,
          endTime,
        }),
      ).unwrap();
      Alert.alert(
        "Booking request sent",
        `Your booking request was sent to ${workerName || "the worker"}.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      setValidationError(
        typeof error === "string" ? error : "Unable to send booking request.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Request a Booking" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="calendar-outline" size={24} color="#FF6B35" />
            </View>
            <View style={styles.introText}>
              <Text style={styles.title}>
                Book {workerName || "this worker"}
              </Text>
              {jobTitle ? (
                <Text style={styles.subtitle}>For: {jobTitle}</Text>
              ) : (
                <Text style={styles.subtitle}>
                  Choose a date and time for your booking request.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.formCard}>
            <ProfileDatePicker
              label="Preferred date"
              value={scheduledDate}
              onChange={setScheduledDate}
              minimumDate={getStartOfToday()}
            />

            <Text style={styles.label}>Start time (24-hour HH:MM)</Text>
            <TextInput
              accessibilityLabel="Start time"
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <Text style={styles.label}>End time (24-hour HH:MM)</Text>
            <TextInput
              accessibilityLabel="End time"
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="11:00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            {(validationError || requestError) && (
              <Text style={styles.errorText}>
                {validationError || requestError}
              </Text>
            )}

            <TouchableOpacity
              accessibilityRole="button"
              disabled={submitting}
              style={[
                styles.submitButton,
                submitting && styles.disabledButton,
              ]}
              onPress={() => void sendRequest()}
            >
              <Ionicons name="send-outline" size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {submitting ? "Sending request..." : "Send Booking Request"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
  },
  introCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  introIcon: {
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  introText: {
    flex: 1,
  },
  title: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    gap: 12,
    padding: 16,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 9,
    borderWidth: 1,
    color: "#111827",
    fontSize: 15,
    height: 48,
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
