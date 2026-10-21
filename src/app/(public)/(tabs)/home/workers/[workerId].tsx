// app/(public)/worker/[id].tsx
import {
  selectWorkerById,
  selectWorkerDetailsError,
  selectWorkerDetailsLoading,
} from "@/app/store/home/homeSelector";
import { fetchWorkerById } from "@/app/store/home/homeThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectApiAuthUser } from "@/app/store/auth/authSelector";
import { selectCurrentUser } from "@/app/store/profile/profileSelector";
import Header from "@/components/Splash/commonComponents/Header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip, Divider } from "react-native-paper";

export default function WorkerDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workerId: string | string[] }>();
  const workerId = Array.isArray(params.workerId)
    ? params.workerId[0]
    : params.workerId;
  const dispatch = useAppDispatch();
  const worker = useAppSelector((state) =>
    workerId ? selectWorkerById(state, workerId) : null,
  );
  const isLoading = useAppSelector((state) =>
    workerId ? selectWorkerDetailsLoading(state, workerId) : false,
  );
  const error = useAppSelector((state) =>
    workerId ? selectWorkerDetailsError(state, workerId) : null,
  );
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const profileUser = useAppSelector(selectCurrentUser);
  const isWorkerViewer =
    (profileUser ?? apiAuthUser)?.role.toUpperCase() === "WORKER";
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (workerId && !worker && !isLoading && !error) {
      void dispatch(fetchWorkerById(workerId));
    }
  }, [dispatch, error, isLoading, worker, workerId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>{t("worker.loading")}</Text>
      </View>
    );
  }

  if (error || !worker) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error || t("worker.failed")}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            if (workerId) {
              void dispatch(fetchWorkerById(workerId));
            }
          }}
        >
          <Text style={styles.retryButtonText}>{t("worker.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    if (worker.user?.phone) {
      Linking.openURL(`tel:${worker.user.phone}`);
    }
  };

  const handleMessage = () => {
    // Navigate to chat screen
    router.push(`/(chat)/${worker.id}`);
  };

  const handleHire = () => {
    // Navigate to hire/booking screen
    router.push(`/(public)/hire/${worker.id}`);
  };

  const workerServices = worker.services ?? [];
  const workerExperiences = worker.experiences ?? [];
  const workerEducation = worker.education ?? [];
  const workerPortfolio = worker.portfolio ?? [];
  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Back Button */}
      <Header title={t("worker.profileTitle")} />

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              worker.user?.avatar ||
              worker.avatarPath ||
              "https://i.pravatar.cc/200",
          }}
          style={styles.avatar}
        />

        <View style={styles.nameContainer}>
          <Text style={styles.name}>{worker.user?.name || worker.name}</Text>
          {worker.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.verifiedText}>{t("worker.verified")}</Text>
            </View>
          )}
        </View>

        <Text style={styles.profession}>{worker.profession}</Text>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.location}>
            {worker.location?.district}, {worker.location?.city}
          </Text>
        </View>

        {/* Rating and Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={20} color="#FFB800" />
              <Text style={styles.ratingText}>
                {worker.rating?.toFixed(1) ||
                  Number(worker.averageRating || 0).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.statLabel}>{t("worker.rating")}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{worker.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>{t("worker.jobsDone")}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{worker.experience || 0}+</Text>
            <Text style={styles.statLabel}>{t("worker.yearsExp")}</Text>
          </View>

          {worker.hourlyRate && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>Rs.{worker.hourlyRate}</Text>
                <Text style={styles.statLabel}>{t("worker.hourlyRate")}</Text>
              </View>
            </>
          )}
        </View>

        {!isWorkerViewer && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#FFFFFF" />
              <Text style={styles.callButtonText}>{t("worker.call")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FF6B35" />
              <Text style={styles.messageButtonText}>{t("worker.message")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hireButton} onPress={handleHire}>
              <Text style={styles.hireButtonText}>{t("worker.hireNow")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={22} color="#FF6B35" />
            <Text style={styles.sectionTitle}>{t("worker.categories")}</Text>
          </View>
          <View style={styles.skillsContainer}>
            {worker.categories.map((category) => (
              <Chip key={category.id} style={styles.skillChip}>
                {category.nameEn}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* About Section */}
      {worker.description && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#FF6B35"
              />
              <Text style={styles.sectionTitle}>{t("worker.about")}</Text>
            </View>
            <Text
              style={styles.description}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {worker.description}
            </Text>
            {worker.description.length > 120 && (
              <TouchableOpacity onPress={toggleDescription}>
                <Text style={styles.readMore}>
                  {isExpanded ? t("worker.readLess") : t("worker.readMore")}
                </Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
      )}

      {workerExperiences.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase-outline" size={22} color="#FF6B35" />
              <Text style={styles.sectionTitle}>
                {t("worker.workExperience")}
              </Text>
            </View>
            {workerExperiences.map((experience, index) => (
              <View key={experience.id}>
                <View style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>
                      {experience.jobTitle} · {experience.companyName}
                    </Text>
                    <Text style={styles.serviceDescription}>
                      {experience.startDate.slice(0, 10) || "—"} -{" "}
                      {experience.isCurrent
                        ? t("worker.present")
                        : (experience.endDate?.slice(0, 10) ?? "—")}
                    </Text>
                    {experience.description && (
                      <Text style={styles.serviceDescription}>
                        {experience.description}
                      </Text>
                    )}
                  </View>
                </View>
                {index < workerExperiences.length - 1 && (
                  <Divider style={styles.serviceDivider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {(worker.educationSummary || workerEducation.length > 0) && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="school-outline" size={22} color="#FF6B35" />
              <Text style={styles.sectionTitle}>{t("worker.education")}</Text>
            </View>
            {worker.educationSummary && (
              <Text style={styles.description}>
                {worker.educationSummary}
              </Text>
            )}
            {workerEducation.map((education, index) => (
              <View key={education.id}>
                <View style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>
                      {education.qualification}
                    </Text>
                    <Text style={styles.serviceDescription}>
                      {education.institution}
                    </Text>
                    {education.description && (
                      <Text style={styles.serviceDescription}>
                        {education.description}
                      </Text>
                    )}
                  </View>
                </View>
                {index < workerEducation.length - 1 && (
                  <Divider style={styles.serviceDivider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {workerPortfolio.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="images-outline" size={22} color="#FF6B35" />
              <Text style={styles.sectionTitle}>{t("worker.portfolio")}</Text>
            </View>
            {workerPortfolio.map((item, index) => (
              <View key={item.id}>
                <View style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.serviceDescription}>
                        {item.description}
                      </Text>
                    )}
                    {item.completedAt && (
                      <Text style={styles.serviceDuration}>
                        {item.completedAt.slice(0, 10)}
                      </Text>
                    )}
                  </View>
                </View>
                {index < workerPortfolio.length - 1 && (
                  <Divider style={styles.serviceDivider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Services Section */}
      {workerServices.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="construct-outline" size={22} color="#FF6B35" />
              <Text style={styles.sectionTitle}>{t("worker.services")}</Text>
            </View>

            {workerServices.map((service, index) => (
              <View key={service.id}>
                <View style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceDescription}>
                        {service.description}
                      </Text>
                    )}
                    {service.duration && (
                      <Text style={styles.serviceDuration}>
                        ⏱ {service.duration}
                      </Text>
                    )}
                  </View>
                  {service.price && (
                    <Text style={styles.servicePrice}>Rs. {service.price}</Text>
                  )}
                </View>
                {index < workerServices.length - 1 && (
                  <Divider style={styles.serviceDivider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Skills Section */}
      {worker.skills && worker.skills.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={22} color="#FF6B35" />
              <Text style={styles.sectionTitle}>{t("worker.skills")}</Text>
            </View>

            <View style={styles.skillsContainer}>
              {worker.skills.map((skill: string) => (
                <Chip key={skill} style={styles.skillChip}>
                  {skill}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Availability Section */}
      {worker.availability && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={22} color="#FF6B35" />
              <Text style={styles.sectionTitle}>
                {t("worker.availability")}
              </Text>
            </View>

            <View style={styles.availabilityStatus}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      worker.availability.status === "available"
                        ? "#34C759"
                        : worker.availability.status === "busy"
                          ? "#FF9500"
                          : "#FF3B30",
                  },
                ]}
              />
              <Text style={styles.availabilityText}>
                {t(`worker.${worker.availability.status}`) ||
                  worker.availability.status}
              </Text>
            </View>

            {worker.availability.schedule?.map(
              (schedule: string, index: number) => (
                <Text key={index} style={styles.scheduleText}>
                  • {schedule}
                </Text>
              ),
            )}
          </Card.Content>
        </Card>
      )}

      {/* Certifications Section */}
      {worker.certifications && worker.certifications.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="ribbon-outline" size={22} color="#FF6B35" />
              <Text style={styles.sectionTitle}>
                {t("worker.certifications")}
              </Text>
            </View>

            {worker.certifications.map((cert: string, index: number) => (
              <View key={index} style={styles.certItem}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Bottom Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  shareButton: {
    padding: 4,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FF6B35",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: "#34C759",
    fontWeight: "500",
  },
  profession: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },
  actionButtons: {
    flexDirection: "row",
    width: "100%",
    marginTop: 16,
    gap: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F0",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  messageButtonText: {
    color: "#FF6B35",
    fontWeight: "600",
    fontSize: 14,
  },
  hireButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 10,
    borderRadius: 8,
  },
  hireButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
    marginTop: 4,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  serviceDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  serviceDuration: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF6B35",
  },
  serviceDivider: {
    marginVertical: 4,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#FFF5F0",
    borderColor: "#FF6B35",
    borderWidth: 1,
  },
  availabilityStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  availabilityText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  scheduleText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
    paddingLeft: 4,
  },
  certItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  certText: {
    fontSize: 14,
    color: "#4B5563",
  },
  languagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageChip: {
    backgroundColor: "#F3F4F6",
  },
  bottomSpacer: {
    height: 30,
  },
});
