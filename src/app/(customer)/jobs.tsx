import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import { Job, JobStatus } from "../../types";

export default function CustomerJobsScreen() {
  const router = useRouter();

  const [filter, setFilter] = useState<string>("all");

  // --------------------------------------------------
  // Temporary data
  // Replace these with Redux selectors later
  // --------------------------------------------------

  const jobs: Job[] = [];

  const isLoading = false;

  const refetch = () => {
    // TODO:
    // Dispatch Redux action here
    // Example:
    // dispatch(fetchCustomerJobs());
  };

  // --------------------------------------------------
  // Filter jobs
  // --------------------------------------------------

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "active") {
      return (
        job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.QUOTING
      );
    }

    if (filter === "completed") {
      return job.status === JobStatus.COMPLETED;
    }

    if (filter === "cancelled") {
      return job.status === JobStatus.CANCELLED;
    }

    return true;
  });

  // --------------------------------------------------
  // Status color
  // --------------------------------------------------

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN:
        return "#007AFF";

      case JobStatus.QUOTING:
        return "#FF9500";

      case JobStatus.IN_PROGRESS:
        return "#34C759";

      case JobStatus.COMPLETED:
        return "#8E8E93";

      case JobStatus.CANCELLED:
        return "#FF3B30";

      default:
        return "#8E8E93";
    }
  };

  // --------------------------------------------------
  // Job card
  // --------------------------------------------------

  const renderJobCard = ({ item }: { item: Job }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/(customer)/job/${item.id}`)}
      >
        <Card style={styles.jobCard}>
          <Card.Content>
            {/* Header */}
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{item.title}</Text>

              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  {
                    borderColor: statusColor,
                  },
                ]}
                textStyle={[
                  styles.statusText,
                  {
                    color: statusColor,
                  },
                ]}
              >
                {String(item.status).replace("_", " ").toUpperCase()}
              </Chip>
            </View>

            {/* Category */}
            <Text style={styles.jobCategory}>{item.category}</Text>

            {/* Description */}
            <Text style={styles.jobDescription} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Footer */}
            <View style={styles.jobFooter}>
              <View style={styles.jobMeta}>
                <Ionicons name="location-outline" size={16} color="#666" />

                <Text style={styles.jobMetaText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              <Text style={styles.jobBudget}>${item.budget}</Text>
            </View>

            {/* Worker */}
            {item.worker && (
              <View style={styles.workerInfo}>
                <Text style={styles.workerLabel}>Assigned to:</Text>

                <Text style={styles.workerName}>{item.worker.name}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // --------------------------------------------------
  // Screen
  // --------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Filters */}
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          {
            value: "all",
            label: "All",
          },
          {
            value: "active",
            label: "Active",
          },
          {
            value: "completed",
            label: "Completed",
          },
          {
            value: "cancelled",
            label: "Cancelled",
          },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Jobs */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredJobs.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />

            <Text style={styles.emptyTitle}>No jobs found</Text>

            <Text style={styles.emptyText}>
              {filter === "all"
                ? "You haven't created any jobs yet"
                : `No ${filter} jobs`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  segmentedButtons: {
    margin: 16,
    backgroundColor: "#fff",
  },

  listContent: {
    padding: 16,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  jobCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },

  statusChip: {
    height: 24,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  jobCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  jobDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },

  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  jobMetaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },

  jobBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },

  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  workerLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },

  workerName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1a1a1a",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    flex: 1,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
