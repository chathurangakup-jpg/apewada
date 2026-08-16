import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Card, Chip } from "react-native-paper";
import { useWorkers } from "../../hooks/useWorkers";

export default function PublicWorkersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: workers, isLoading, refetch } = useWorkers();

  const filteredWorkers = workers?.filter((worker) => {
    const matchesSearch =
      worker.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = params.category
      ? worker.profession.toLowerCase() ===
        (params.category as string).toLowerCase()
      : true;

    return matchesSearch && matchesCategory;
  });

  const renderWorkerCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(public)/worker/${item.id}`)}
    >
      <Card style={styles.workerCard}>
        <Card.Content>
          <View style={styles.workerHeader}>
            <View style={styles.workerInfo}>
              {/* <Text style={styles.workerName}>{item.user.name}</Text> */}
              <Text style={styles.workerProfession}>{item.profession}</Text>
              <View style={styles.workerMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFB800" />
                  <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.jobCount}>{item.totalJobs} jobs</Text>
                {item.verified && (
                  <>
                    <Text style={styles.dot}>•</Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#34C759"
                      />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </View>
          <View style={styles.servicesContainer}>
            {item.services.slice(0, 3).map((service: any) => (
              <Chip
                key={service.id}
                style={styles.serviceChip}
                textStyle={styles.serviceChipText}
              >
                {service.name}
              </Chip>
            ))}
            {item.services.length > 3 && (
              <Chip
                style={styles.serviceChip}
                textStyle={styles.serviceChipText}
              >
                +{item.services.length - 3} more
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workers by name or profession..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={filteredWorkers}
        renderItem={renderWorkerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No workers found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try a different search term"
                : "No workers available right now"}
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
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#1a1a1a",
  },
  listContent: {
    padding: 16,
  },
  workerCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  workerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  workerProfession: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  workerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: "#1a1a1a",
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
    color: "#ccc",
  },
  jobCount: {
    fontSize: 12,
    color: "#666",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 12,
    color: "#34C759",
    marginLeft: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  serviceChip: {
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: "#f0f0f0",
    height: 28,
  },
  serviceChipText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
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
