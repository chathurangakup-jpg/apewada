import {
  selectCustomerJobRequests,
  selectCustomerJobRequestsError,
  selectCustomerJobRequestsLoading,
} from "@/app/store/customer/customerSelector";
import { fetchCustomerJobRequests } from "@/app/store/customer/customerThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import Header from "@/components/Splash/commonComponents/Header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip } from "react-native-paper";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");

function formatDate(value: string) {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value,
  );
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function formatBudget(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `LKR ${amount.toLocaleString()}`
    : `LKR ${value}`;
}

function avatarUri(path?: string | null) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

function statusColor(status: string) {
  switch (status.toUpperCase()) {
    case "ACCEPTED":
      return "#16A34A";
    case "REJECTED":
      return "#DC2626";
    default:
      return "#D97706";
  }
}

export default function WorkerRequestsScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    jobId?: string | string[];
    jobTitle?: string | string[];
  }>();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const jobTitle = Array.isArray(params.jobTitle)
    ? params.jobTitle[0]
    : params.jobTitle;
  const requests = useAppSelector((state) =>
    selectCustomerJobRequests(state, jobId),
  );
  const isLoading = useAppSelector((state) =>
    selectCustomerJobRequestsLoading(state, jobId),
  );
  const error = useAppSelector((state) =>
    selectCustomerJobRequestsError(state, jobId),
  );
  const displayError =
    error ??
    (!jobId
      ? "Unable to identify this job. Return to My Jobs and try again."
      : null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    if (jobId) {
      await dispatch(fetchCustomerJobRequests(jobId));
    }
  }, [dispatch, jobId]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const refreshRequests = async () => {
    setRefreshing(true);
    try {
      await loadRequests();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && requests.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Worker Requests" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading worker requests...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Worker Requests" />
      {jobTitle ? (
        <View style={styles.jobHeader}>
          <Text style={styles.jobLabel}>Requests for</Text>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {jobTitle}
          </Text>
        </View>
      ) : null}
      {displayError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{displayError}</Text>
          <TouchableOpacity onPress={() => void refreshRequests()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={requests}
        keyExtractor={(request) => request.id}
        contentContainerStyle={[
          styles.list,
          requests.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshRequests}
          />
        }
        renderItem={({ item: request }) => {
          const workerAvatar = avatarUri(request.workerAvatarPath);
          const requestStatusColor = statusColor(request.status);

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.workerHeader}>
                  <View style={styles.avatar}>
                    {workerAvatar ? (
                      <Image
                        source={{ uri: workerAvatar }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#FF6B35" />
                    )}
                  </View>
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName}>{request.workerName}</Text>
                    <View style={styles.rating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingText}>
                        {request.averageRating ?? "New"}{" "}
                        {request.reviewCount != null
                          ? `(${request.reviewCount} reviews)`
                          : ""}
                      </Text>
                    </View>
                    {request.experienceYears != null ? (
                      <Text style={styles.experience}>
                        {request.experienceYears} years of experience
                      </Text>
                    ) : null}
                  </View>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { borderColor: requestStatusColor },
                    ]}
                    textStyle={[
                      styles.statusText,
                      { color: requestStatusColor },
                    ]}
                  >
                    {request.status.replaceAll("_", " ")}
                  </Chip>
                </View>

                {request.workerBio ? (
                  <Text style={styles.bio}>{request.workerBio}</Text>
                ) : null}

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proposed budget</Text>
                    <Text style={styles.budget}>
                      {formatBudget(request.proposedBudget)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proposed date</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(request.proposedDate)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.messageLabel}>Worker's message</Text>
                <Text style={styles.message}>{request.message}</Text>
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={
          !displayError ? (
            <View style={styles.empty}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color="#D1D5DB"
              />
              <Text style={styles.emptyTitle}>No worker requests yet</Text>
              <Text style={styles.emptyText}>
                Quotations from workers for this job will appear here.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 12,
  },
  jobHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  jobLabel: {
    color: "#6B7280",
    fontSize: 12,
  },
  jobTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 3,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  workerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    overflow: "hidden",
    width: 56,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "700",
  },
  rating: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    color: "#6B7280",
    fontSize: 12,
  },
  experience: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 3,
  },
  statusChip: {
    backgroundColor: "#FFFFFF",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  bio: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  details: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
    marginTop: 14,
    paddingVertical: 12,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 13,
  },
  detailValue: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "600",
  },
  budget: {
    color: "#FF6B35",
    fontSize: 15,
    fontWeight: "700",
  },
  messageLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
  },
  message: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },
  empty: {
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  errorText: {
    color: "#B91C1C",
    flex: 1,
    fontSize: 13,
    marginRight: 12,
  },
  retryText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "700",
  },
});
