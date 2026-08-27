// app/(public)/jobs.tsx

import JobCard from "@/components/Jobs/JobCard";
import Header from "@/components/Splash/commonComponents/Header";
import { CATEGORIES } from "@/constants/mockData";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Chip } from "react-native-paper";
import { useGetJobsQuery } from "../../../../store/jobs/jobApi";

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
// SCREEN
// ============================================================

export default function PublicJobsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);

  // ============================================================
  // URL CATEGORY
  // ============================================================

  const category =
    typeof params.category === "string" ? params.category : undefined;

  useEffect(() => {
    if (category) {
      setSelectedCategory(category.toLowerCase());
    }
  }, [category]);

  // ============================================================
  // FETCH JOBS
  // ============================================================

  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useGetJobsQuery({
    category: selectedCategory !== "All" ? selectedCategory : undefined,

    district:
      selectedDistrict !== "All Districts" ? selectedDistrict : undefined,

    search: searchQuery || undefined,

    status: "open",

    sortBy: "createdAt",
    sortOrder: "desc",

    page: 1,

    // Load all/large number of jobs for the See All screen
    limit: 50,
  });

  const jobs = jobsData?.jobs ?? [];

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // JOB PRESS
  // ============================================================

  const handleJobPress = (jobId: string) => {
    router.push(`/(public)/home/jobs/${jobId}`);
  };

  // ============================================================
  // CATEGORY
  // ============================================================

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // ============================================================
  // DISTRICT
  // ============================================================

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setIsDistrictDropdownOpen(false);
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDistrict("All Districts");
  };

  // ============================================================
  // DISTRICT DROPDOWN
  // ============================================================

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
          {/* Header */}
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Select District</Text>

            <TouchableOpacity onPress={() => setIsDistrictDropdownOpen(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Districts */}
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

  // ============================================================
  // JOB CARD
  // ============================================================

  const renderJobCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleJobPress(item.id)}
        style={styles.cardWrapper}
      >
        <JobCard job={item} />
      </TouchableOpacity>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />

        <Text style={styles.loadingText}>{t("jobs.loading")}</Text>
      </View>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />

        <Text style={styles.errorText}>{t("jobs.failed")}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>{t("jobs.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <View style={styles.container}>
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <Header title={t("jobs.title")} />

      {/* ====================================================== */}
      {/* SEARCH */}
      {/* ====================================================== */}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />

          <TextInput
            style={styles.searchInput}
            placeholder={t("jobs.searchPlaceholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ====================================================== */}
      {/* DISTRICT FILTER */}
      {/* ====================================================== */}

      <View style={styles.districtFilterRow}>
        <TouchableOpacity
          style={styles.districtFilterButton}
          onPress={() => setIsDistrictDropdownOpen(true)}
        >
          <Ionicons name="location-outline" size={18} color="#FF6B35" />

          <Text style={styles.districtFilterText} numberOfLines={1}>
            {selectedDistrict}
          </Text>

          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* ====================================================== */}
      {/* CATEGORY FILTER */}
      {/* ====================================================== */}

      <View style={styles.categorySection}>
        <Text style={styles.filterTitle}>{t("jobs.category")}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {/* ALL */}

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
              {t("jobs.all")}
            </Text>
          </TouchableOpacity>

          {/* CATEGORIES */}

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

      {/* ====================================================== */}
      {/* ACTIVE FILTERS */}
      {/* ====================================================== */}

      {(selectedDistrict !== "All Districts" ||
        selectedCategory !== "All" ||
        searchQuery) && (
        <View style={styles.activeFilters}>
          {selectedDistrict !== "All Districts" && (
            <Chip
              mode="outlined"
              onClose={() => setSelectedDistrict("All Districts")}
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterText}
            >
              📍 {selectedDistrict}
            </Chip>
          )}

          {selectedCategory !== "All" && (
            <Chip
              mode="outlined"
              onClose={() => setSelectedCategory("All")}
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterText}
            >
              {selectedCategory}
            </Chip>
          )}

          {searchQuery.length > 0 && (
            <Chip
              mode="outlined"
              onClose={() => setSearchQuery("")}
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterText}
            >
              🔍 {searchQuery}
            </Chip>
          )}

          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearAllText}>{t("jobs.clearAll")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ====================================================== */}
      {/* RESULTS COUNT */}
      {/* ====================================================== */}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Found {jobs.length} job
          {jobs.length !== 1 ? "s" : ""}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {selectedDistrict !== "All Districts" && ` in ${selectedDistrict}`}
        </Text>
      </View>

      {/* ====================================================== */}
      {/* JOB LIST */}
      {/* ====================================================== */}

      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          jobs.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />

            <Text style={styles.emptyTitle}>{t("jobs.noJobsFound")}</Text>

            <Text style={styles.emptyText}>
              {searchQuery
                ? t("jobs.noJobsForQuery", { query: searchQuery })
                : selectedCategory !== "All" &&
                    selectedDistrict !== "All Districts"
                  ? t("jobs.noCategoryJobsInDistrict", {
                      category: selectedCategory,
                      district: selectedDistrict,
                    })
                  : selectedCategory !== "All"
                    ? t("jobs.noCategoryJobs", { category: selectedCategory })
                    : selectedDistrict !== "All Districts"
                      ? t("jobs.noJobsInDistrict", {
                          district: selectedDistrict,
                        })
                      : t("jobs.noJobsAvailable")}
            </Text>

            {(searchQuery ||
              selectedCategory !== "All" ||
              selectedDistrict !== "All Districts") && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>
                  {t("jobs.clearAllFilters")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* ====================================================== */}
      {/* DISTRICT MODAL */}
      {/* ====================================================== */}

      {renderDistrictDropdown()}
    </View>
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

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#1F2937",
  },

  // ==========================================================
  // DISTRICT
  // ==========================================================

  districtFilterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },

  districtFilterButton: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  districtFilterText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },

  // ==========================================================
  // CATEGORY
  // ==========================================================

  categorySection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  categoryFilterContent: {
    paddingHorizontal: 16,
  },

  categoryFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },

  categoryFilterChipActive: {
    backgroundColor: "#FF6B35",
  },

  categoryFilterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  categoryFilterTextActive: {
    color: "#FFFFFF",
  },

  // ==========================================================
  // ACTIVE FILTERS
  // ==========================================================

  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },

  activeFilterChip: {
    backgroundColor: "#FFF7F2",
    borderColor: "#FF6B35",
    height: 30,
  },

  activeFilterText: {
    fontSize: 12,
    color: "#1F2937",
  },

  clearAllText: {
    fontSize: 13,
    color: "#FF6B35",
    fontWeight: "500",
    paddingHorizontal: 8,
  },

  // ==========================================================
  // RESULTS
  // ==========================================================

  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
  },

  resultsText: {
    fontSize: 13,
    color: "#6B7280",
  },

  // ==========================================================
  // JOB LIST
  // ==========================================================

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },

  cardWrapper: {
    marginBottom: 10,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  clearButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
  },

  clearButtonText: {
    color: "#FF6B35",
    fontWeight: "500",
    fontSize: 14,
  },

  // ==========================================================
  // DISTRICT MODAL
  // ==========================================================

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
});
