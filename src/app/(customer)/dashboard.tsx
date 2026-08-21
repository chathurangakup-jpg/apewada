import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Button, Card, Chip } from "react-native-paper";
import { JobStatus } from "../../types";

export default function CustomerDashboardScreen() {
  const router = useRouter();

  // TODO: Replace these with Redux selectors/API data
  const isLoading = false;

  const user = {
    name: "Customer",
    avatar: "https://i.pravatar.cc/150",
  };

  const jobs: any[] = [];

  const activeJobs = jobs.filter(
    (job) =>
      job.status !== JobStatus.COMPLETED && job.status !== JobStatus.CANCELLED,
  );

  const recentJobs = jobs;

  const refetch = () => {
    // TODO: Dispatch Redux action here
    console.log("Refreshing dashboard...");
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "findWorker":
        router.push("/(public)/workers");
        break;

      case "myJobs":
        router.push("/(customer)/jobs");
        break;

      case "reviews":
        router.push("/(customer)/reviews");
        break;

      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>

          <Text style={styles.name}>{user?.name || "Customer"} 👋</Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/(customer)/profile")}>
          <Image
            source={{
              uri: user?.avatar || "https://i.pravatar.cc/150",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeJobs.length}</Text>

          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{jobs.length}</Text>

          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleQuickAction("findWorker")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="search" size={28} color="#007AFF" />
          </View>

          <Text style={styles.actionLabel}>Find Worker</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleQuickAction("myJobs")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="briefcase" size={28} color="#007AFF" />
          </View>

          <Text style={styles.actionLabel}>My Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleQuickAction("reviews")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="star" size={28} color="#007AFF" />
          </View>

          <Text style={styles.actionLabel}>Reviews</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(customer)/profile")}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="person" size={28} color="#007AFF" />
          </View>

          <Text style={styles.actionLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Active Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Jobs</Text>

          <TouchableOpacity onPress={() => router.push("/(customer)/jobs")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {activeJobs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No active jobs</Text>

              <Text style={styles.emptySubtext}>
                Find a worker to get started
              </Text>

              <Button
                mode="contained"
                onPress={() => router.push("/(public)/workers")}
                style={styles.emptyButton}
              >
                Find Workers
              </Button>
            </Card.Content>
          </Card>
        ) : (
          activeJobs.slice(0, 3).map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => router.push(`/(customer)/job/${job.id}`)}
            >
              <Card style={styles.jobCard}>
                <Card.Content>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>

                    <Chip
                      mode="outlined"
                      style={styles.statusChip}
                      textStyle={styles.statusText}
                    >
                      {String(job.status).replace("_", " ").toUpperCase()}
                    </Chip>
                  </View>

                  <Text style={styles.jobCategory}>{job.category}</Text>

                  <Text style={styles.jobBudget}>${job.budget}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
          </View>

          {recentJobs.slice(0, 2).map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => router.push(`/(customer)/job/${job.id}`)}
            >
              <Card style={styles.jobCard}>
                <Card.Content>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>

                    <Chip
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        job.status === JobStatus.COMPLETED &&
                          styles.completedChip,
                      ]}
                      textStyle={styles.statusText}
                    >
                      {String(job.status).replace("_", " ").toUpperCase()}
                    </Chip>
                  </View>

                  <Text style={styles.jobCategory}>{job.category}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  greeting: {
    fontSize: 14,
    color: "#666",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  statsContainer: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-around",
    backgroundColor: "#fff",
    marginTop: 1,
  },

  statCard: {
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 1,
  },

  actionButton: {
    alignItems: "center",
  },

  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  actionLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },

  seeAll: {
    color: "#007AFF",
    fontSize: 14,
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
    fontWeight: "500",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },

  jobCategory: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  jobBudget: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 4,
  },

  statusChip: {
    height: 24,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  completedChip: {
    borderColor: "#34C759",
  },

  emptyCard: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    textAlign: "center",
  },

  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },

  emptyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
  },
});
