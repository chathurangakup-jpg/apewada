// app/(public)/home.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Chip, Searchbar } from "react-native-paper";

const { width } = Dimensions.get("window");

// ============================================================
// MOCK DATA
// ============================================================

const mockWorkers = [
  {
    id: "worker-1",
    user: {
      id: "user-1",
      name: "Kasun Perera",
      avatar: "https://i.pravatar.cc/300?img=12",
    },
    profession: "Plumber",
    category: "plumbing",
    rating: 4.9,
    totalJobs: 128,
    verified: true,
    location: {
      district: "Colombo",
      city: "Nugegoda",
    },
    services: [
      { id: "s1", name: "Pipe Repair" },
      { id: "s2", name: "Bathroom Plumbing" },
      { id: "s3", name: "Water Tank Installation" },
    ],
  },
  {
    id: "worker-2",
    user: {
      id: "user-2",
      name: "Nimal Fernando",
      avatar: "https://i.pravatar.cc/300?img=13",
    },
    profession: "Electrician",
    category: "electrical",
    rating: 4.8,
    totalJobs: 96,
    verified: true,
    location: {
      district: "Kalutara",
      city: "Panadura",
    },
    services: [
      { id: "s4", name: "House Wiring" },
      { id: "s5", name: "Electrical Repair" },
      { id: "s6", name: "Light Installation" },
    ],
  },
  {
    id: "worker-3",
    user: {
      id: "user-3",
      name: "Ruwan Silva",
      avatar: "https://i.pravatar.cc/300?img=14",
    },
    profession: "Carpenter",
    category: "carpentry",
    rating: 4.7,
    totalJobs: 84,
    verified: true,
    location: {
      district: "Gampaha",
      city: "Kadawatha",
    },
    services: [
      { id: "s7", name: "Furniture Repair" },
      { id: "s8", name: "Custom Furniture" },
      { id: "s9", name: "Door Installation" },
    ],
  },
  {
    id: "worker-4",
    user: {
      id: "user-4",
      name: "Chaminda Jayasuriya",
      avatar: "https://i.pravatar.cc/300?img=15",
    },
    profession: "Gardener",
    category: "gardening",
    rating: 4.6,
    totalJobs: 72,
    verified: false,
    location: {
      district: "Colombo",
      city: "Maharagama",
    },
    services: [
      { id: "s10", name: "Garden Maintenance" },
      { id: "s11", name: "Tree Trimming" },
      { id: "s12", name: "Planting" },
    ],
  },
  {
    id: "worker-5",
    user: {
      id: "user-5",
      name: "Tharindu Kumara",
      avatar: "https://i.pravatar.cc/300?img=16",
    },
    profession: "Painter",
    category: "painting",
    rating: 4.8,
    totalJobs: 65,
    verified: true,
    location: {
      district: "Kandy",
      city: "Peradeniya",
    },
    services: [
      { id: "s13", name: "House Painting" },
      { id: "s14", name: "Wall Painting" },
      { id: "s15", name: "Interior Painting" },
    ],
  },
  {
    id: "worker-6",
    user: {
      id: "user-6",
      name: "Saman Wijesinghe",
      avatar: "https://i.pravatar.cc/300?img=17",
    },
    profession: "Grass Cutter",
    category: "grass cutting",
    rating: 4.5,
    totalJobs: 53,
    verified: false,
    location: {
      district: "Kalutara",
      city: "Beruwala",
    },
    services: [
      { id: "s16", name: "Grass Cutting" },
      { id: "s17", name: "Garden Cleaning" },
      { id: "s18", name: "Weed Removal" },
    ],
  },
];

const mockJobs = [
  {
    id: "job-1",
    title: "Bathroom Plumbing Repair",
    description:
      "Need an experienced plumber to repair leaking pipes in the bathroom.",
    category: "Plumbing",
    budget: 15000,
    location: {
      district: "Colombo",
      city: "Nugegoda",
    },
  },
  {
    id: "job-2",
    title: "House Electrical Wiring",
    description:
      "Looking for an electrician to complete electrical wiring for a new house.",
    category: "Electrical",
    budget: 45000,
    location: {
      district: "Kalutara",
      city: "Panadura",
    },
  },
  {
    id: "job-3",
    title: "Custom Kitchen Cabinets",
    description:
      "Need a skilled carpenter to build and install custom kitchen cabinets.",
    category: "Carpentry",
    budget: 85000,
    location: {
      district: "Gampaha",
      city: "Kadawatha",
    },
  },
  {
    id: "job-4",
    title: "Garden Cleaning",
    description: "Need someone to clean and maintain a residential garden.",
    category: "Gardening",
    budget: 12000,
    location: {
      district: "Colombo",
      city: "Maharagama",
    },
  },
  {
    id: "job-5",
    title: "House Exterior Painting",
    description:
      "Looking for an experienced painter to paint the exterior of a house.",
    category: "Painting",
    budget: 60000,
    location: {
      district: "Kandy",
      city: "Peradeniya",
    },
  },
  {
    id: "job-6",
    title: "Large Garden Grass Cutting",
    description:
      "Need regular grass cutting and garden cleaning for a large property.",
    category: "Grass Cutting",
    budget: 10000,
    location: {
      district: "Kalutara",
      city: "Beruwala",
    },
  },
];

// ============================================================
// DISTRICTS
// ============================================================

const SRI_LANKA_DISTRICTS = [
  "All Districts",
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
];

// ============================================================
// CATEGORIES
// ============================================================

const CATEGORIES = [
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "construct-outline",
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: "flash-outline",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    icon: "hammer-outline",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: "sparkles-outline",
  },
  {
    id: "painting",
    name: "Painting",
    icon: "color-palette-outline",
  },
  {
    id: "gardening",
    name: "Gardening",
    icon: "leaf-outline",
  },
  {
    id: "grass cutting",
    name: "Grass Cutting",
    icon: "cut-outline",
  },
  {
    id: "carpenter",
    name: "Carpenter",
    icon: "build-outline",
  },
];

// ============================================================
// SCREEN
// ============================================================

export default function PublicHomeScreen() {
  const router = useRouter();

  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================================
  // FILTER WORKERS
  // ==========================================================

  const filteredWorkers = mockWorkers.filter((worker) => {
    const matchesDistrict =
      selectedDistrict === "All Districts" ||
      worker.location.district === selectedDistrict;

    const matchesCategory =
      selectedCategory === "All" ||
      worker.category.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      query === "" ||
      worker.user.name.toLowerCase().includes(query) ||
      worker.profession.toLowerCase().includes(query) ||
      worker.location.district.toLowerCase().includes(query);

    return matchesDistrict && matchesCategory && matchesSearch;
  });

  // ==========================================================
  // FILTER JOBS
  // ==========================================================

  const filteredJobs = mockJobs.filter((job) => {
    const matchesDistrict =
      selectedDistrict === "All Districts" ||
      job.location.district === selectedDistrict;

    const matchesCategory =
      selectedCategory === "All" ||
      job.category.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      query === "" ||
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.category.toLowerCase().includes(query);

    return matchesDistrict && matchesCategory && matchesSearch;
  });

  const featuredWorkers = filteredWorkers.slice(0, 5);
  const recentJobs = filteredJobs.slice(0, 4);

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGetStarted = () => {
    router.push("/(auth)/login");
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setIsDistrictDropdownOpen(false);
  };

  const clearFilters = () => {
    setSelectedDistrict("All Districts");
    setSelectedCategory("All");
    setSearchQuery("");
  };

  // ==========================================================
  // DISTRICT MODAL
  // ==========================================================

  const renderDistrictDropdown = () => (
    <Modal
      visible={isDistrictDropdownOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsDistrictDropdownOpen(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setIsDistrictDropdownOpen(false)}
      >
        <Pressable
          style={styles.dropdownModal}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Select District</Text>

            <TouchableOpacity onPress={() => setIsDistrictDropdownOpen(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={SRI_LANKA_DISTRICTS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedDistrict === item && styles.dropdownItemSelected,
                ]}
                onPress={() => handleDistrictSelect(item)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedDistrict === item &&
                      styles.dropdownItemTextSelected,
                  ]}
                >
                  {item}
                </Text>

                {selectedDistrict === item && (
                  <Ionicons name="checkmark" size={20} color="#FF6B35" />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ======================================================
          FILTER SECTION
      ====================================================== */}

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search workers or services..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#FF6B35"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.filterRow}>
          {/* District */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsDistrictDropdownOpen(true)}
          >
            <Ionicons name="location-outline" size={18} color="#FF6B35" />

            <Text style={styles.filterButtonText}>
              {selectedDistrict.length > 12
                ? `${selectedDistrict.substring(0, 12)}...`
                : selectedDistrict}
            </Text>

            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilterScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryFilterChip,
                selectedCategory === "All" && styles.categoryFilterChipActive,
              ]}
              onPress={() => handleCategorySelect("All")}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === "All" && styles.categoryFilterTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.name.toLowerCase();

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryFilterChip,
                    active && styles.categoryFilterChipActive,
                  ]}
                  onPress={() =>
                    handleCategorySelect(category.name.toLowerCase())
                  }
                >
                  <Ionicons
                    name={category.icon as any}
                    size={14}
                    color={active ? "#FFFFFF" : "#FF6B35"}
                  />

                  <Text
                    style={[
                      styles.categoryFilterText,
                      active && styles.categoryFilterTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ======================================================
          HERO
      ====================================================== */}

      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Find Trusted</Text>

          <Text style={styles.heroTitleHighlight}>Service Workers</Text>

          <Text style={styles.heroSubtitle}>
            Connect with verified professionals for your home and business
            needs.
          </Text>

          <View style={styles.heroButtons}>
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.primaryButton}
              labelStyle={styles.buttonLabel}
              icon="arrow-right"
            >
              Get Started
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.push("/(public)/workers")}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}
            >
              Browse Workers
            </Button>
          </View>
        </View>

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600",
          }}
          style={styles.heroImage}
        />
      </View>

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => {
                setSelectedCategory(category.name.toLowerCase());

                router.push(
                  `/(public)/workers?category=${encodeURIComponent(
                    category.name,
                  )}`,
                );
              }}
            >
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={category.icon as any}
                  size={32}
                  color="#FF6B35"
                />
              </View>

              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ======================================================
          FEATURED WORKERS
      ====================================================== */}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDistrict !== "All Districts"
              ? `Top Workers in ${selectedDistrict}`
              : "Top Rated Workers"}
          </Text>

          <TouchableOpacity onPress={() => router.push("/(public)/workers")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {featuredWorkers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredWorkers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={styles.workerCard}
                onPress={() => router.push(`/(public)/worker/${worker.id}`)}
              >
                <Image
                  source={{
                    uri: worker.user.avatar || "https://i.pravatar.cc/150",
                  }}
                  style={styles.workerAvatar}
                />

                <Text style={styles.workerName}>{worker.user.name}</Text>

                <Text style={styles.workerProfession}>{worker.profession}</Text>

                <View style={styles.workerRating}>
                  <Ionicons name="star" size={14} color="#FFB800" />

                  <Text style={styles.workerRatingText}>
                    {worker.rating.toFixed(1)}
                  </Text>

                  <Text style={styles.workerJobs}>
                    ({worker.totalJobs} jobs)
                  </Text>
                </View>

                {worker.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#34C759"
                    />

                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}

                <View style={styles.workerLocation}>
                  <Ionicons name="location" size={10} color="#6B7280" />

                  <Text style={styles.workerLocationText}>
                    {worker.location.district}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />

            <Text style={styles.emptyStateText}>No workers found</Text>

            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.emptyStateLink}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ======================================================
          RECENT JOBS
      ====================================================== */}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDistrict !== "All Districts"
              ? `Recent Jobs in ${selectedDistrict}`
              : "Recent Jobs"}
          </Text>

          <TouchableOpacity onPress={() => router.push("/(public)/jobs")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentJobs.length > 0 ? (
          recentJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => router.push(`/(public)/job/${job.id}`)}
            >
              <Card style={styles.jobCard}>
                <Card.Content>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>

                    <Chip
                      mode="outlined"
                      style={styles.jobChip}
                      textStyle={styles.jobChipText}
                    >
                      {job.category}
                    </Chip>
                  </View>

                  <Text style={styles.jobDescription} numberOfLines={2}>
                    {job.description}
                  </Text>

                  <View style={styles.jobFooter}>
                    <View style={styles.jobMeta}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#6B7280"
                      />

                      <Text style={styles.jobMetaText}>
                        {job.location.district}
                      </Text>
                    </View>

                    <Text style={styles.jobBudget}>
                      Rs. {job.budget.toLocaleString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />

            <Text style={styles.emptyStateText}>No jobs found</Text>

            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.emptyStateLink}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ======================================================
          CTA
      ====================================================== */}

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Get Started?</Text>

        <Text style={styles.ctaText}>
          Find trusted workers for your next home or business project.
        </Text>

        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.ctaButton}
          labelStyle={styles.ctaButtonLabel}
        >
          Sign Up Now
        </Button>
      </View>

      {renderDistrictDropdown()}
    </ScrollView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  filterSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  searchContainer: {
    marginBottom: 12,
  },

  searchBar: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    elevation: 0,
    height: 48,
  },

  searchInput: {
    fontSize: 14,
    color: "#1F2937",
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    minWidth: 100,
  },

  filterButtonText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },

  categoryFilterScroll: {
    flex: 1,
  },

  categoryFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },

  categoryFilterChipActive: {
    backgroundColor: "#FF6B35",
  },

  categoryFilterText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  categoryFilterTextActive: {
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  dropdownModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },

  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  dropdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },

  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  dropdownItemSelected: {
    backgroundColor: "#FFF5F0",
  },

  dropdownItemText: {
    fontSize: 15,
    color: "#1F2937",
  },

  dropdownItemTextSelected: {
    color: "#FF6B35",
    fontWeight: "600",
  },

  heroSection: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    minHeight: 200,
  },

  heroContent: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 28,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#1F2937",
  },

  heroTitleHighlight: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FF6B35",
    marginTop: -4,
  },

  heroSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
  },

  heroButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },

  primaryButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    flex: 1,
  },

  secondaryButton: {
    borderColor: "#FF6B35",
    borderRadius: 8,
    flex: 1,
  },

  buttonLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },

  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginLeft: 16,
  },

  section: {
    padding: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },

  seeAll: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "500",
  },

  categoriesScroll: {
    marginTop: 8,
  },

  categoryCard: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },

  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
  },

  categoryName: {
    fontSize: 12,
    color: "#1F2937",
    marginTop: 4,
    textAlign: "center",
  },

  workerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    width: 140,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  workerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  workerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 8,
    textAlign: "center",
  },

  workerProfession: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  workerRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  workerRatingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1F2937",
    marginLeft: 2,
  },

  workerJobs: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  verifiedText: {
    fontSize: 11,
    color: "#34C759",
    marginLeft: 2,
  },

  workerLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 2,
  },

  workerLocationText: {
    fontSize: 10,
    color: "#6B7280",
  },

  jobCard: {
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },

  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },

  jobChip: {
    height: 24,
    borderColor: "#FF6B35",
  },

  jobChipText: {
    fontSize: 10,
    color: "#FF6B35",
  },

  jobDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  jobMetaText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },

  jobBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B35",
  },

  ctaSection: {
    backgroundColor: "#FF6B35",
    padding: 30,
    margin: 20,
    marginBottom: 30,
    borderRadius: 16,
    alignItems: "center",
  },

  ctaTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  ctaText: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },

  ctaButton: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },

  ctaButtonLabel: {
    color: "#FF6B35",
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },

  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
  },

  emptyStateLink: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
  },
});
