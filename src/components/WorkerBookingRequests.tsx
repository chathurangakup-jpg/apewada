import type { Booking } from "@/app/store/bookings/bookingServices";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card, Divider } from "react-native-paper";

interface WorkerBookingRequestsProps {
  requests: Booking[];
}

function formatDate(value?: string) {
  if (!value) return "Date not set";

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatTime(value?: string | null) {
  return value ? value.slice(0, 5) : "—";
}

export default function WorkerBookingRequests({
  requests,
}: WorkerBookingRequestsProps) {
  const [expanded, setExpanded] = useState(false);

  if (requests.length === 0) return null;

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={styles.header}
      >
        <View style={styles.titleContainer}>
          <Ionicons name="calendar-outline" size={22} color="#FF6B35" />
          <Text style={styles.title}>Booking history</Text>
          <Text style={styles.count}>{requests.length}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.list}>
          {requests.map((request, index) => (
            <View key={request.id}>
              <View style={styles.request}>
                <Text style={styles.jobTitle}>
                  {request.jobTitle || "General booking"}
                </Text>
                <Text style={styles.detail}>
                  Date: {formatDate(request.scheduledDate)}
                </Text>
                <Text style={styles.detail}>
                  Time: {formatTime(request.startTime)} -{" "}
                  {formatTime(request.endTime)}
                </Text>
                <Text style={styles.status}>Status: {request.status}</Text>
              </View>
              {index < requests.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  count: {
    color: "#6B7280",
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  request: {
    paddingVertical: 12,
    gap: 4,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  detail: {
    fontSize: 13,
    color: "#6B7280",
  },
  status: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
});
