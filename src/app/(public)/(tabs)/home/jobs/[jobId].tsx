import {
  selectJobById,
  selectJobDetailsError,
  selectJobDetailsLoading,
} from "@/app/store/home/homeSelector";
import { fetchJobById } from "@/app/store/home/homeThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectApiAuthUser } from "@/app/store/auth/authSelector";
import { selectCurrentUser } from "@/app/store/profile/profileSelector";
import Header from "@/components/Splash/commonComponents/Header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ============================================================
// SCREEN
// ============================================================

export default function JobDetailsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{
    jobId: string | string[];
  }>();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const job = useAppSelector((state) =>
    jobId ? selectJobById(state, jobId) : null,
  );
  const isLoading = useAppSelector((state) =>
    jobId ? selectJobDetailsLoading(state, jobId) : false,
  );
  const error = useAppSelector((state) =>
    jobId ? selectJobDetailsError(state, jobId) : null,
  );
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const profileUser = useAppSelector(selectCurrentUser);
  const isWorkerViewer =
    (profileUser ?? apiAuthUser)?.role.toUpperCase() === "WORKER";

  useEffect(() => {
    if (jobId && !job && !isLoading && !error) {
      void dispatch(fetchJobById(jobId));
    }
  }, [dispatch, error, isLoading, job, jobId]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />

        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />

        <Text style={styles.errorTitle}>
          {error || t("jobs.jobDetailsNotFound")}
        </Text>

        <Text style={styles.errorText}>
          We couldn&apos;t load this job. It may have been removed or is no
          longer available.
        </Text>

        <View style={styles.errorActions}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (jobId) {
                void dispatch(fetchJobById(jobId));
              }
            }}
          >
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />

            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "N/A";
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const formattedDate = formatDate(job.createdAt);
  const preferredDate = formatDate(job.preferredDate);
  const categoryName = i18n.resolvedLanguage?.startsWith("si")
    ? job.categoryNameSi || job.categoryNameEn
    : job.categoryNameEn;
  const jobImages = job.images?.length
    ? job.images
    : job.image
      ? [job.image]
      : [];

  const isOpen = job.status?.toLowerCase() === "open";

  // ============================================================
  // UI
  // ============================================================

  return (
    <View style={styles.container}>
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <Header title="Job Details" />

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==================================================== */}
        {/* JOB IMAGE */}
        {/* ==================================================== */}

        <View style={styles.imageContainer}>
          {jobImages.length > 0 ? (
            <Image
              source={{ uri: jobImages[0] }}
              style={styles.jobImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="briefcase-outline" size={60} color="#D1D5DB" />
            </View>
          )}

          {/* STATUS */}

          <View style={styles.statusBadge}>
            <View
              style={[styles.statusDot, !isOpen && styles.statusDotClosed]}
            />

            <Text
              style={[styles.statusText, !isOpen && styles.statusTextClosed]}
            >
              {job.status || "—"}
            </Text>
          </View>
        </View>

        {jobImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageGallery}
          >
            {jobImages.slice(1).map((image, index) => (
              <Image
                key={`${image}-${index}`}
                source={{ uri: image }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>
        )}

        {/* ==================================================== */}
        {/* MAIN CONTENT */}
        {/* ==================================================== */}

        <View style={styles.contentContainer}>
          {/* ================================================== */}
          {/* CATEGORY */}
          {/* ================================================== */}

          <View style={styles.categoryBadge}>
            <Ionicons name="briefcase-outline" size={14} color="#FF6B35" />

            <Text style={styles.categoryText}>
              {categoryName ||
                (typeof job.category === "string"
                  ? job.category
                  : job.category?.nameEn) ||
                "General"}
            </Text>
          </View>

          {/* ================================================== */}
          {/* TITLE */}
          {/* ================================================== */}

          <Text style={styles.title}>{job.title}</Text>

          {/* ================================================== */}
          {/* LOCATION */}
          {/* ================================================== */}

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={21} color="#FF6B35" />

            <View style={styles.locationContent}>
              <Text style={styles.locationCity}>
                {job.location?.city || job.city || "—"}
              </Text>

              <Text style={styles.locationDistrict}>
                {job.location?.district || job.district || "—"}
              </Text>
            </View>
          </View>

          {/* ================================================== */}
          {/* DESCRIPTION */}
          {/* ================================================== */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>

            <Text style={styles.description}>{job.description}</Text>
          </View>

          {/* ================================================== */}
          {/* LOCATION DETAILS */}
          {/* ================================================== */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Location</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location-outline" size={20} color="#FF6B35" />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>District</Text>

                  <Text style={styles.infoValue}>
                    {job.location?.district || job.district || "—"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="navigate-outline" size={20} color="#FF6B35" />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>City</Text>

                  <Text style={styles.infoValue}>
                    {job.location?.city || job.city || "—"}
                  </Text>
                </View>

                {job.venue && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIcon}>
                        <Ionicons
                          name="navigate-circle-outline"
                          size={20}
                          color="#FF6B35"
                        />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Venue</Text>
                        <Text style={styles.infoValue}>{job.venue}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* ================================================== */}
          {/* JOB INFORMATION */}
          {/* ================================================== */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Information</Text>

            <View style={styles.infoCard}>
              {/* Posted Date */}

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar-outline" size={20} color="#FF6B35" />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Posted On</Text>

                  <Text style={styles.infoValue}>{formattedDate}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="time-outline" size={20} color="#FF6B35" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Last Updated</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(job.updatedAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="pricetag-outline" size={20} color="#FF6B35" />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Category</Text>

                  <Text style={styles.infoValue}>
                    {categoryName ||
                      (typeof job.category === "string"
                        ? job.category
                        : job.category?.nameEn) ||
                      "General"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="calendar-clear-outline"
                    size={20}
                    color="#FF6B35"
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Preferred Date</Text>
                  <Text style={styles.infoValue}>{preferredDate}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Status */}

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={isOpen ? "#22C55E" : "#9CA3AF"}
                  />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Status</Text>

                  <Text style={[styles.infoValue, isOpen && styles.openStatus]}>
                    {job.status || "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {job.rejectionReason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Review Note</Text>
              <View style={styles.infoCard}>
                <Text style={styles.description}>{job.rejectionReason}</Text>
              </View>
            </View>
          )}

          {(job.approvedAt || job.approvedBy) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Approval</Text>
              <View style={styles.infoCard}>
                {job.approvedAt && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#22C55E"
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Approved On</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(job.approvedAt)}
                      </Text>
                    </View>
                  </View>
                )}
                {job.approvedBy && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="person-circle-outline"
                        size={20}
                        color="#FF6B35"
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Approved By</Text>
                      <Text style={styles.infoValue}>{job.approvedBy}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ================================================== */}
          {/* CLIENT */}
          {/* ================================================== */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted By</Text>

            <TouchableOpacity style={styles.clientCard} activeOpacity={0.8}>
              <View style={styles.clientAvatar}>
                {job.customer?.avatarPath ? (
                  <Image
                    source={{ uri: job.customer.avatarPath }}
                    style={styles.customerAvatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={26} color="#FF6B35" />
                )}
              </View>

              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>
                  {job.customer?.name || "Customer"}
                </Text>

                <Text style={styles.clientId}>
                  Customer ID:{" "}
                  {job.customer?.id || job.customerId || job.clientId || "—"}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ====================================================== */}
      {/* BOTTOM ACTION */}
      {/* ====================================================== */}

      {isOpen && isWorkerViewer && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.applyButton}
            activeOpacity={0.8}
            onPress={() => {
              // TODO:
              // Navigate to quotation/apply screen
              console.log("Apply for job:", job.id);
            }}
          >
            <Ionicons name="send-outline" size={20} color="#FFFFFF" />

            <Text style={styles.applyButtonText}>Apply for This Job</Text>
          </TouchableOpacity>
        </View>
      )}
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

  scrollContent: {
    paddingBottom: 120,
  },

  // ==========================================================
  // CENTER
  // ==========================================================

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
  },

  errorActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#FFF5F0",
  },

  backButtonText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageContainer: {
    height: 240,
    backgroundColor: "#E5E7EB",
    position: "relative",
  },

  imageGallery: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  galleryImage: {
    width: 112,
    height: 88,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },

  jobImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  statusDotClosed: {
    backgroundColor: "#9CA3AF",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
    textTransform: "capitalize",
  },

  statusTextClosed: {
    color: "#6B7280",
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },

  categoryText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "600",
  },

  title: {
    marginTop: 12,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: "700",
    color: "#111827",
  },

  // ==========================================================
  // LOCATION
  // ==========================================================

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 9,
  },

  locationContent: {
    flex: 1,
  },

  locationCity: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  locationDistrict: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },

  // ==========================================================
  // BUDGET
  // ==========================================================

  budgetCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  budgetIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F0",
    marginRight: 12,
  },

  budgetContent: {
    flex: 1,
  },

  budgetLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  budgetValue: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
  },

  // ==========================================================
  // INFO CARD
  // ==========================================================

  infoCard: {
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F0",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    textTransform: "capitalize",
  },

  openStatus: {
    color: "#16A34A",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },

  // ==========================================================
  // CLIENT
  // ==========================================================

  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F0",
  },

  customerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },

  clientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  clientId: {
    marginTop: 3,
    fontSize: 12,
    color: "#9CA3AF",
  },

  // ==========================================================
  // BOTTOM ACTION
  // ==========================================================

  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  applyButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
  },

  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ==========================================================
  // FETCHING
  // ==========================================================

  fetchingIndicator: {
    position: "absolute",
    top: 100,
    right: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});
