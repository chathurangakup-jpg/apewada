import HomeWorkerTile from "@/components/HomeWorkerTile";
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
  selectAllWorkers,
  selectAllWorkersError,
  selectAllWorkersLoading,
} from "@/app/store/home/homeSelector";
import type { HomeWorker } from "@/app/store/home/homeServices";
import { fetchAllWorkers } from "@/app/store/home/homeThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";

export default function AllWorkersScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const workers = useAppSelector(selectAllWorkers);
  const isLoading = useAppSelector(selectAllWorkersLoading);
  const error = useAppSelector(selectAllWorkersError);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void dispatch(fetchAllWorkers());
  }, [dispatch]);

  const refreshWorkers = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAllWorkers());
    } finally {
      setRefreshing(false);
    }
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
          <TouchableOpacity style={styles.retryButton} onPress={refreshWorkers}>
            <Text style={styles.retryText}>{t("jobs.retry")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={48} color="#D1D5DB" />
        <Text style={styles.messageText}>{t("home.noWorkersFound")}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t("home.allWorkersTitle")} />
      {error && workers.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity onPress={refreshWorkers}>
            <Text style={styles.retryText}>{t("jobs.retry")}</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={workers}
        keyExtractor={(worker) => worker.id}
        numColumns={2}
        columnWrapperStyle={styles.workerRow}
        contentContainerStyle={[
          styles.listContent,
          workers.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }: { item: HomeWorker }) => (
          <HomeWorkerTile
            worker={item}
            style={styles.workerTile}
            onPress={() =>
              router.push({
                pathname: "/(public)/(tabs)/home/workers/[workerId]",
                params: { workerId: item.id },
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshWorkers} />
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
  workerRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  workerTile: {
    marginRight: 0,
    marginBottom: 0,
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
