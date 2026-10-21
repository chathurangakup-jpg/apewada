import JobCard from "@/components/Jobs/JobCard";
import Header from "@/components/Splash/commonComponents/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  selectAllJobs,
  selectAllJobsError,
  selectAllJobsLoading,
} from "@/app/store/home/homeSelector";
import type { HomeJob } from "@/app/store/home/homeServices";
import { fetchAllJobs, fetchJobById } from "@/app/store/home/homeThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";

export default function AllJobsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const jobs = useAppSelector(selectAllJobs);
  const isLoading = useAppSelector(selectAllJobsLoading);
  const error = useAppSelector(selectAllJobsError);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void dispatch(fetchAllJobs());
  }, [dispatch]);

  const refreshJobs = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAllJobs());
    } finally {
      setRefreshing(false);
    }
  };

  const handleJobPress = (jobId: string) => {
    void dispatch(fetchJobById(jobId));
    router.push({
      pathname: "/(public)/(tabs)/home/jobs/[jobId]",
      params: { jobId },
    });
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshJobs}>
            <Text style={styles.retryText}>{t("jobs.retry")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
        <Text style={styles.messageText}>{t("home.noJobsFound")}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t("home.allJobsTitle")} />
      {error && jobs.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity onPress={refreshJobs}>
            <Text style={styles.retryText}>{t("jobs.retry")}</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={jobs}
        keyExtractor={(job) => job.id}
        contentContainerStyle={[
          styles.listContent,
          jobs.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }: { item: HomeJob }) => (
          <JobCard job={item} onPress={() => handleJobPress(item.id)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshJobs} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    padding: 24,
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
  messageText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
