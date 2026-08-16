import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Modal,
  Portal,
} from "react-native-paper";
import { useWorkers } from "../../hooks/useWorkers";
import { WorkerSearchFilters } from "../../types";

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<WorkerSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: workers, isLoading, refetch } = useWorkers(filters);

  const filteredWorkers = workers?.filter(
    (worker) =>
      worker.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFilterApply = (newFilters: WorkerSearchFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const renderWorkerCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(public)/worker/${item.id}`)}
    >
      <Card style={styles.workerCard}>
        <Card.Content>
          <View style={styles.workerHeader}>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{item.user.name}</Text>
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
            placeholder="Search workers, services..."
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
        <TouchableOpacity
          style={[
            styles.filterButton,
            Object.keys(filters).length > 0 && styles.filterActive,
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="options-outline"
            size={24}
            color={Object.keys(filters).length > 0 ? "#007AFF" : "#666"}
          />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFilters}
        >
          {filters.profession && (
            <Chip
              onClose={() => setFilters({ ...filters, profession: undefined })}
              style={styles.filterChip}
            >
              {filters.profession}
            </Chip>
          )}
          {filters.location && (
            <Chip
              onClose={() => setFilters({ ...filters, location: undefined })}
              style={styles.filterChip}
            >
              {filters.location}
            </Chip>
          )}
          {filters.minRating && (
            <Chip
              onClose={() => setFilters({ ...filters, minRating: undefined })}
              style={styles.filterChip}
            >
              {filters.minRating}+ Stars
            </Chip>
          )}
          {filters.verified !== undefined && (
            <Chip
              onClose={() => setFilters({ ...filters, verified: undefined })}
              style={styles.filterChip}
            >
              Verified Only
            </Chip>
          )}
        </ScrollView>
      )}

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
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      {/* Filters Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filters</Text>

            <Text style={styles.filterLabel}>Profession</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="e.g., Plumber"
              value={filters.profession || ""}
              onChangeText={(text) =>
                setFilters({ ...filters, profession: text })
              }
            />

            <Text style={styles.filterLabel}>Location</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="e.g., Downtown"
              value={filters.location || ""}
              onChangeText={(text) =>
                setFilters({ ...filters, location: text })
              }
            />

            <Text style={styles.filterLabel}>Minimum Rating</Text>
            <View style={styles.ratingFilter}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    filters.minRating === rating && styles.ratingOptionActive,
                  ]}
                  onPress={() => setFilters({ ...filters, minRating: rating })}
                >
                  <Text
                    style={[
                      styles.ratingOptionText,
                      filters.minRating === rating &&
                        styles.ratingOptionTextActive,
                    ]}
                  >
                    {rating}★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setFilters({});
                  setShowFilters(false);
                }}
                style={styles.modalButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => handleFilterApply(filters)}
                style={[styles.modalButton, styles.applyButton]}
              >
                Apply Filters
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
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
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
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
  filterButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  filterActive: {
    backgroundColor: "#E3F2FD",
  },
  activeFilters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  filterChip: {
    marginRight: 8,
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
  modalContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    maxHeight: "80%",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  ratingFilter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  ratingOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginHorizontal: 4,
  },
  ratingOptionActive: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  ratingOptionText: {
    fontSize: 14,
    color: "#666",
  },
  ratingOptionTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: "#007AFF",
  },
});
