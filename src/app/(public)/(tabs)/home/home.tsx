// app/(public)/home.tsx
import DistrictDropdown from "@/components/DistrictDropdown";
import HomeWorkerTile from "@/components/HomeWorkerTile";
import JobCard from "@/components/Jobs/JobCard";
import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Chip } from "react-native-paper";
import { selectApiAuthUser } from "../../../store/auth/authSelector";
import { selectHomeState } from "../../../store/home/homeSelector";
import { HomeCategory, HomeWorker } from "../../../store/home/homeServices";
import { fetchHomeData } from "../../../store/home/homeThunk";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { selectCurrentUser } from "../../../store/profile/profileSelector";
import { fetchCurrentProfile } from "../../../store/profile/profileThunk";

// ============================================================
// CATEGORIES
// ============================================================

// ============================================================
// SCREEN
// ============================================================

export default function PublicHomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { categories, topRatedWorkers, recentJobs, isLoading, error } =
    useAppSelector(selectHomeState);
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const profileUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = Boolean(apiAuthUser || profileUser);
  const authenticatedUser = profileUser ?? apiAuthUser;
  const authenticatedUserRole = authenticatedUser?.role.toUpperCase();
  const authenticatedUserRoleLabel =
    authenticatedUserRole === "WORKER"
      ? t("home.workerRole")
      : authenticatedUserRole === "CUSTOMER"
        ? t("home.customerRole")
        : null;
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchHomeData());
    dispatch(fetchCurrentProfile());
  }, [dispatch]);

  const filteredWorkers = useMemo(() => {
    return [...topRatedWorkers]
      .filter((worker: HomeWorker) => {
        const workerCategory =
          typeof worker.categories === "string"
            ? worker.categories
            : (worker.categories?.[0]?.slug ?? worker.categories?.[0]?.nameEn);
        const district = worker.district ?? worker.district;
        const searchText = [worker.name, worker.bio, workerCategory, district]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (selectedCategory === "All" ||
            workerCategory?.toLowerCase() === selectedCategory) &&
          (selectedDistrict === "All Districts" ||
            district === selectedDistrict) &&
          (!searchQuery || searchText.includes(searchQuery.toLowerCase()))
        );
      })
      .sort(
        (a, b) => Number(b.averageRating ?? 0) - Number(a.averageRating ?? 0),
      )
      .slice(0, 5);
  }, [topRatedWorkers, selectedCategory, selectedDistrict, searchQuery]);

  // const filteredJobs = useMemo(
  //   () =>
  //     recentJobs.filter((job) => {
  //       const jobCategory =
  //         typeof job.category === "string"
  //           ? job.category
  //           : (job.category?.slug ?? job.category?.nameEn);
  //       const district = job.location?.district ?? job.district;
  //       const searchText = [
  //         job.title,
  //         job.name,
  //         job.description,
  //         jobCategory,
  //         district,
  //       ]
  //         .filter(Boolean)
  //         .join(" ")
  //         .toLowerCase();

  //       return (
  //         (selectedCategory === "All" ||
  //           jobCategory?.toLowerCase() === selectedCategory) &&
  //         (selectedDistrict === "All Districts" ||
  //           district === selectedDistrict) &&
  //         (!searchQuery || searchText.includes(searchQuery.toLowerCase()))
  //       );
  //     }),
  //   [recentJobs, selectedCategory, selectedDistrict, searchQuery],
  // );

  // ==========================================================
  // REFRESH HANDLER
  // ==========================================================

  const filteredJobs = useMemo(
    () =>
      recentJobs.filter((job: any) => {
        // API returns flat fields: categorySlug, categoryNameEn, district, city
        const jobCategorySlug =
          job.categorySlug ??
          (typeof job.category === "string"
            ? job.category
            : (job.category?.slug ?? job.category?.nameEn));

        const district = job.district ?? job.location?.district;

        const searchText = [
          job.title,
          job.name,
          job.description,
          job.categoryNameEn,
          jobCategorySlug,
          district,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesCategory =
          selectedCategory === "All" ||
          (jobCategorySlug &&
            jobCategorySlug.toLowerCase() === selectedCategory.toLowerCase());

        const matchesDistrict =
          selectedDistrict === "All Districts" || district === selectedDistrict;

        const matchesSearch =
          !searchQuery || searchText.includes(searchQuery.toLowerCase());

        return matchesCategory && matchesDistrict && matchesSearch;
      }),
    [recentJobs, selectedCategory, selectedDistrict, searchQuery],
  );

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await dispatch(fetchHomeData());
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
    console.log("Selected category:", category);
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSelectedDistrict("All Districts");
    setSelectedCategory("All");
    setSearchQuery("");
  };

  // ==========================================================
  // RENDER HELPERS
  // ==========================================================

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

      {error && <Text style={styles.emptyStateText}>{error}</Text>}

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

        {isAuthenticated && (
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="person-outline" size={22} color="#FF6B35" />
              </View>
              <View style={styles.welcomeUserDetails}>
                <Text style={styles.welcomeTitle}>
                  {t("home.welcome", {
                    name: authenticatedUser?.name || t("home.member"),
                  })}
                </Text>
                {authenticatedUserRoleLabel && (
                  <Text style={styles.welcomeRole}>
                    {authenticatedUserRoleLabel}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.welcomeDescription}>
              {t("home.welcomeIntro")}
            </Text>
          </View>
        )}

        <View style={styles.filterDistrict}>
          {/* District */}
          <DistrictDropdown
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            includeAllDistricts
            leadingIcon="location-outline"
            buttonStyle={styles.filterButton}
            valueStyle={styles.filterButtonText}
          />
        </View>
        <View style={styles.heroButtons}>
          {!isAuthenticated && (
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.primaryButton}
              labelStyle={styles.buttonLabel}
              icon="arrow-right"
            >
              {t("home.getStarted")}
            </Button>
          )}
          {!isAuthenticated && (
            <Button
              mode="outlined"
              onPress={() => router.push("/(public)/workers")}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}
            >
              {t("home.browseWorkers")}
            </Button>
          )}
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
          {categories.map((category: HomeCategory) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.slug &&
                  styles.categoryCardSelected,
              ]}
              onPress={() => handleCategorySelect(category.slug)}
            >
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={category.icon as any}
                  size={32}
                  color="#FF6B35"
                />
              </View>
              <Text style={styles.categoryName}>
                {i18n.resolvedLanguage?.startsWith("si")
                  ? category.nameSi
                  : category.nameEn}
              </Text>
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
            onPress={() =>
              router.push("/(public)/(tabs)/home/workers/allWorkers")
            }
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredWorkers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredWorkers.map((worker) => (
              <HomeWorkerTile
                key={worker.id}
                worker={worker}
                onPress={() =>
                  router.push({
                    pathname: "/(public)/(tabs)/home/workers/[workerId]",
                    params: { workerId: worker.id },
                  })
                }
              />
            ))}
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
            onPress={() => router.push("/(public)/(tabs)/home/jobs/all")}
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

      {!isAuthenticated && (
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
      )}
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

  filterDistrict: {
    paddingHorizontal: 20,
  },

  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FDE2D5",
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },

  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  welcomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  welcomeUserDetails: {
    flex: 1,
  },

  welcomeTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "700",
  },

  welcomeRole: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  welcomeDescription: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
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
