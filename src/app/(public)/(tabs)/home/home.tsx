// app/(public)/home.tsx
import JobCard from "@/components/Jobs/JobCard";
import { CATEGORIES } from "@/constants/mockData";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Chip } from "react-native-paper";
import { useGetJobsQuery } from "../../../store/jobs/jobApi";
import { useGetWorkersQuery } from "../../../store/workers/workerApi";

const { width } = Dimensions.get("window");

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

// ============================================================
// SCREEN
// ============================================================

export default function PublicHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // REDUX QUERIES
  // ==========================================================

  // Use the main workers query so district + category are sent to
  // the API together. This also works with the current mock API.
  const {
    data: workersData,
    isLoading: isLoadingWorkers,
    error: workersError,
    refetch: refetchWorkers,
  } = useGetWorkersQuery({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    district:
      selectedDistrict !== "All Districts" ? selectedDistrict : undefined,
    search: searchQuery || undefined,
    limit: 20,
  });

  // Use getJobs instead of getRecentJobs because getJobs already
  // supports both category and district filtering.
  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    error: jobsError,
    refetch: refetchJobs,
  } = useGetJobsQuery({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    district:
      selectedDistrict !== "All Districts" ? selectedDistrict : undefined,
    search: searchQuery || undefined,
    status: "open",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 4,
  });

  // Workers are already filtered by the API. Sort them by rating
  // for the home-page "Top Workers" section.
  const filteredWorkers = useMemo(() => {
    return [...(workersData?.workers ?? [])]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }, [workersData?.workers]);

  const filteredJobs = jobsData?.jobs ?? [];

  // ==========================================================
  // REFRESH HANDLER
  // ==========================================================

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchWorkers(), refetchJobs()]);
    } finally {
      setRefreshing(false);
    }
  };

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
  // RENDER HELPERS
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
            <Text style={styles.dropdownTitle}>{t("jobs.selectDistrict")}</Text>
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

  const renderWorkerCard = (worker: any) => (
    <TouchableOpacity
      key={worker.id}
      style={styles.workerCard}
      onPress={() => router.push(`/(public)/home/workers/${worker.id}`)}
    >
      <Image
        source={{
          uri: worker.user?.avatar || "https://i.pravatar.cc/150",
        }}
        style={styles.workerAvatar}
      />
      <Text style={styles.workerName}>{worker.user?.name}</Text>
      <Text style={styles.workerProfession}>{worker.profession}</Text>
      <View style={styles.workerRating}>
        <Ionicons name="star" size={14} color="#FFB800" />
        <Text style={styles.workerRatingText}>
          {worker.rating?.toFixed(1) || "0.0"}
        </Text>
        <Text style={styles.workerJobs}>({worker.totalJobs || 0} jobs)</Text>
      </View>
      {worker.verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#34C759" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
      <View style={styles.workerLocation}>
        <Ionicons name="location" size={10} color="#6B7280" />
        <Text style={styles.workerLocationText}>
          {worker.location?.district}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderJobCard = ({ item }: { item: any }) => {
    return (
      <JobCard
        job={item}
        onPress={() => router.push(`/(public)/home/jobs/jobs`)}
      />
    );
  };

  // const renderJobCard = (job: any) => (
  //   <TouchableOpacity
  //     key={job.id}
  //     onPress={() => router.push(`/(public)/job/${job.id}`)}
  //   >
  //     <Card style={styles.jobCard}>
  //       <Card.Content>
  //         <View style={styles.jobHeader}>
  //           <Text style={styles.jobTitle}>{job.title}</Text>
  //           <Chip
  //             mode="outlined"
  //             style={styles.jobChip}
  //             textStyle={styles.jobChipText}
  //           >
  //             {job.category}
  //           </Chip>
  //         </View>
  //         <Text style={styles.jobDescription} numberOfLines={2}>
  //           {job.description}
  //         </Text>
  //         <View style={styles.jobFooter}>
  //           <View style={styles.jobMeta}>
  //             <Ionicons name="location-outline" size={14} color="#6B7280" />
  //             <Text style={styles.jobMetaText}>{job.location?.district}</Text>
  //           </View>
  //           <Text style={styles.jobBudget}>
  //             Rs. {job.budget?.toLocaleString()}
  //           </Text>
  //         </View>
  //       </Card.Content>
  //     </Card>
  //   </TouchableOpacity>
  // );

  // ==========================================================
  // RENDER
  // ==========================================================

  const isLoading = isLoadingWorkers || isLoadingJobs;
  const hasError = workersError || jobsError;

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* ======================================================
          FILTER SECTION
      ====================================================== */}

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          {/* <Searchbar
            placeholder="Search workers or services..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#FF6B35"
            placeholderTextColor="#9CA3AF"
          /> */}
        </View>
      </View>

      {/* ======================================================
          HERO
      ====================================================== */}
      <View>
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{t("home.heroTitleLine1")}</Text>
            <Text style={styles.heroTitleHighlight}>
              {t("home.heroTitleLine2")}
            </Text>
            <Text style={styles.heroSubtitle}>{t("home.heroSubtitle")}</Text>
          </View>

          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600",
            }}
            style={styles.heroImage}
          />
        </View>
        <View style={styles.filterDistrict}>
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
        </View>
        <View style={styles.heroButtons}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.primaryButton}
            labelStyle={styles.buttonLabel}
            icon="arrow-right"
          >
            {t("home.getStarted")}
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/(public)/workers")}
            style={styles.secondaryButton}
            labelStyle={styles.secondaryButtonLabel}
          >
            {t("home.browseWorkers")}
          </Button>
        </View>
      </View>

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <View style={styles.section}>
        <View style={styles.categoryTitleRow}>
          <Text style={styles.sectionTitle}>{t("home.popularCategories")}</Text>
          {selectedCategory !== "All" && (
            <TouchableOpacity
              onPress={() => setSelectedCategory("All")}
              style={styles.clearCategoryButton}
            >
              <Text style={styles.clearCategoryText}>{t("home.clear")}</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.name.toLowerCase() &&
                  styles.categoryCardSelected,
              ]}
              onPress={() => handleCategorySelect(category.name.toLowerCase())}
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
          ACTIVE FILTERS
      ====================================================== */}

      {(selectedDistrict !== "All Districts" || selectedCategory !== "All") && (
        <View style={styles.activeFilters}>
          {selectedDistrict !== "All Districts" && (
            <Chip
              mode="outlined"
              onClose={() => setSelectedDistrict("All Districts")}
              style={styles.activeFilterChip}
            >
              {selectedDistrict}
            </Chip>
          )}

          {selectedCategory !== "All" && (
            <Chip
              mode="outlined"
              onClose={() => setSelectedCategory("All")}
              style={styles.activeFilterChip}
            >
              {selectedCategory}
            </Chip>
          )}
        </View>
      )}

      {/* ======================================================
          FEATURED WORKERS
      ====================================================== */}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDistrict !== "All Districts"
              ? t("home.topWorkersIn", { district: selectedDistrict })
              : t("home.topRatedWorkers")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/home/workers/workers`)}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredWorkers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredWorkers.map(renderWorkerCard)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>
              {t("home.noWorkersFound")}
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.emptyStateLink}>
                {t("home.clearFilters")}
              </Text>
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
              ? `${t("home.recentJobs")} ${t("common.in")} ${selectedDistrict}`
              : t("home.recentJobs")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(public)/home/jobs/jobs")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredJobs.length > 0 ? (
          filteredJobs
            .slice(0, 5)
            .map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>{t("home.noJobsFound")}</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.emptyStateLink}>
                {t("home.clearFilters")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ======================================================
          CTA
      ====================================================== */}

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>{t("home.readyCtaTitle")}</Text>
        <Text style={styles.ctaText}>{t("home.readyCtaText")}</Text>
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.ctaButton}
          labelStyle={styles.ctaButtonLabel}
        >
          {t("home.signUpNow")}
        </Button>
      </View>

      {renderDistrictDropdown()}
    </ScrollView>
  );
}

// ============================================================
// STYLES (same as before - keeping them for brevity)

// Note: All the styles from the original file should be included here
// I've omitted them for brevity but they remain the same

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  filterSection: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  searchContainer: {
    marginBottom: 12,
    marginTop: 40,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.background.dark,
  },

  filterButtonText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
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
  filterDistrict: {
    paddingHorizontal: 20,
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
  },

  heroContent: {
    flex: 1,
    justifyContent: "center",
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

    paddingHorizontal: 20,
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

  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  clearCategoryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  clearCategoryText: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: "600",
  },

  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  activeFilterChip: {
    backgroundColor: "#FFF7F2",
  },

  categoryCard: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },

  categoryCardSelected: {
    borderWidth: 2,
    borderColor: "#FF6B35",
    backgroundColor: "#FFF7F2",
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
    paddingBottom: 10,
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
