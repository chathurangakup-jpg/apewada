import Header from "@/components/Splash/commonComponents/Header";
import {
  selectCustomerJobsError,
  selectCustomerJobsLoading,
  selectCustomerPostedJobs,
} from "@/app/store/customer/customerSelector";
import { fetchCustomerJobs } from "@/app/store/customer/customerThunk";
import { fetchJobById } from "@/app/store/home/homeThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip } from "react-native-paper";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function statusColor(status: string) {
  switch (status) {
    case "PENDING_APPROVAL":
      return "#F59E0B";
    case "OPEN":
      return "#22C55E";
    case "COMPLETED":
      return "#6B7280";
    case "CANCELLED":
    case "REJECTED":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}

export default function MyJobsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(selectCustomerPostedJobs);
  const isLoading = useAppSelector(selectCustomerJobsLoading);
  const error = useAppSelector(selectCustomerJobsError);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void dispatch(fetchCustomerJobs());
  }, [dispatch]);

  const refreshJobs = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchCustomerJobs());
    } finally {
      setRefreshing(false);
    }
  };

  const showJobDetails = (jobId: string) => {
    void dispatch(fetchJobById(jobId));
    router.push({
      pathname: "/(public)/(tabs)/home/jobs/[jobId]",
      params: { jobId },
    });
  };

  if (isLoading && jobs.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Jobs" />
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refreshJobs}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={jobs}
        keyExtractor={(job) => job.id}
        contentContainerStyle={[
          styles.list,
          jobs.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshJobs} />
        }
        renderItem={({ item: job }) => {
          const color = statusColor(job.status);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => showJobDetails(job.id)}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.title} numberOfLines={2}>
                      {job.title}
                    </Text>
                    <Chip
                      mode="outlined"
                      style={[styles.status, { borderColor: color }]}
                      textStyle={[styles.statusText, { color }]}
                    >
                      {formatStatus(job.status)}
                    </Chip>
                  </View>
                  <Text style={styles.category}>
                    {job.categoryNameEn || "General"}
                  </Text>
                  <Text style={styles.description} numberOfLines={2}>
                    {job.description}
                  </Text>
                  <View style={styles.location}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.locationText}>
                      {job.city}, {job.district}
                    </Text>
                  </View>
                  {job.status === "PENDING_APPROVAL" && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        router.push({
                          pathname: "/(public)/(tabs)/home/create-job",
                          params: { jobId: job.id },
                        })
                      }
                    >
                      <Ionicons name="create-outline" size={16} color="#FF6B35" />
                      <Text style={styles.editText}>Edit Job</Text>
                    </TouchableOpacity>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No jobs yet</Text>
            <Text style={styles.emptyText}>
              Create a job to find a worker for your next project.
            </Text>
          </View>
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
  centered: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    flex: 1,
    justifyContent: "center",
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
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  title: {
    color: "#1F2937",
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  status: {
    backgroundColor: "#FFFFFF",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  category: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  description: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  location: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
  },
  locationText: {
    color: "#6B7280",
    fontSize: 13,
  },
  editButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 5,
    marginTop: 12,
  },
  editText: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: "600",
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
