import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip } from "react-native-paper";

type WorkerService = {
  id: string;
  name: string;
};

type MockWorker = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  profession: string;
  location: string;
  rating: number;
  totalJobs: number;
  verified: boolean;
  services: WorkerService[];
};

const mockWorkers: MockWorker[] = [
  {
    id: "worker-1",
    user: {
      id: "user-1",
      name: "Kasun Perera",
    },
    profession: "Carpenter",
    location: "Kalutara",
    rating: 4.8,
    totalJobs: 45,
    verified: true,
    services: [
      {
        id: "service-1",
        name: "Furniture",
      },
      {
        id: "service-2",
        name: "Kitchen Cabinets",
      },
      {
        id: "service-3",
        name: "Doors",
      },
      {
        id: "service-4",
        name: "Wood Repairs",
      },
    ],
  },
  {
    id: "worker-2",
    user: {
      id: "user-2",
      name: "Nimal Fernando",
    },
    profession: "Electrician",
    location: "Panadura",
    rating: 4.6,
    totalJobs: 32,
    verified: true,
    services: [
      {
        id: "service-5",
        name: "House Wiring",
      },
      {
        id: "service-6",
        name: "Electrical Repairs",
      },
      {
        id: "service-7",
        name: "Lighting",
      },
    ],
  },
  {
    id: "worker-3",
    user: {
      id: "user-3",
      name: "Ruwan Silva",
    },
    profession: "Plumber",
    location: "Colombo",
    rating: 4.7,
    totalJobs: 28,
    verified: true,
    services: [
      {
        id: "service-8",
        name: "Pipe Repairs",
      },
      {
        id: "service-9",
        name: "Bathroom Plumbing",
      },
      {
        id: "service-10",
        name: "Water Tanks",
      },
    ],
  },
  {
    id: "worker-4",
    user: {
      id: "user-4",
      name: "Chaminda Jayasuriya",
    },
    profession: "Gardener",
    location: "Wadduwa",
    rating: 4.5,
    totalJobs: 21,
    verified: false,
    services: [
      {
        id: "service-11",
        name: "Garden Cleaning",
      },
      {
        id: "service-12",
        name: "Grass Cutting",
      },
      {
        id: "service-13",
        name: "Tree Trimming",
      },
    ],
  },
  {
    id: "worker-5",
    user: {
      id: "user-5",
      name: "Saman Kumara",
    },
    profession: "Painter",
    location: "Moratuwa",
    rating: 4.9,
    totalJobs: 57,
    verified: true,
    services: [
      {
        id: "service-14",
        name: "House Painting",
      },
      {
        id: "service-15",
        name: "Interior Painting",
      },
      {
        id: "service-16",
        name: "Exterior Painting",
      },
      {
        id: "service-17",
        name: "Wall Repair",
      },
    ],
  },
  {
    id: "worker-6",
    user: {
      id: "user-6",
      name: "Dinesh Perera",
    },
    profession: "Mason",
    location: "Beruwala",
    rating: 4.4,
    totalJobs: 19,
    verified: false,
    services: [
      {
        id: "service-18",
        name: "Brick Work",
      },
      {
        id: "service-19",
        name: "Wall Construction",
      },
      {
        id: "service-20",
        name: "Tile Work",
      },
    ],
  },
];

export default function PublicWorkersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const category =
    typeof params.category === "string" ? params.category : undefined;

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mockWorkers.filter((worker) => {
      const name = worker.user.name.toLowerCase();
      const profession = worker.profession.toLowerCase();
      const location = worker.location.toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        profession.includes(query) ||
        location.includes(query);

      const matchesCategory =
        !category || profession.includes(category.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, category]);

  const handleRefresh = () => {
    setRefreshing(true);

    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const handleWorkerPress = (workerId: string) => {
    router.push(`/(public)/worker/${workerId}`);
  };

  const renderWorkerCard = ({ item }: { item: MockWorker }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleWorkerPress(item.id)}
      >
        <Card style={styles.workerCard}>
          <Card.Content>
            <View style={styles.workerHeader}>
              {/* Worker Info */}
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.user.name}</Text>

                <Text style={styles.workerProfession}>{item.profession}</Text>

                {/* Rating / Jobs / Verified */}
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

              {/* Location */}
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#666" />

                <Text style={styles.location} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            </View>

            {/* Services */}
            <View style={styles.servicesContainer}>
              {item.services.slice(0, 3).map((service) => (
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
  };

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
            returnKeyType="search"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category */}
      {category && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>
            Showing workers for{" "}
            <Text style={styles.categoryValue}>{category}</Text>
          </Text>
        </View>
      )}

      {/* Worker List */}
      <FlatList
        data={filteredWorkers}
        renderItem={renderWorkerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredWorkers.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />

            <Text style={styles.emptyTitle}>No workers found</Text>

            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try a different search term"
                : category
                  ? `No ${category} workers are available`
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

  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#E3F2FD",
  },

  categoryText: {
    fontSize: 13,
    color: "#666",
  },

  categoryValue: {
    fontWeight: "600",
    color: "#007AFF",
  },

  listContent: {
    padding: 16,
  },

  emptyListContent: {
    flexGrow: 1,
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
    paddingRight: 8,
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
    maxWidth: 120,
  },

  location: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flexShrink: 1,
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
    justifyContent: "center",
    flex: 1,
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
    lineHeight: 20,
  },
});
