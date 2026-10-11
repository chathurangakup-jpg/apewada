// app/(public)/profile.tsx
import LanguageSelector from "@/components/Profile/LanguageSelector";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Chip, Divider } from "react-native-paper";
import i18n from "../../../i18n";
import { selectApiAuthUser } from "../../store/auth/authSelector";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectCurrentUser,
  selectCurrentWorkerProfile,
  selectProfileLoading,
} from "../../store/profile/profileSelector";
import {
  fetchCurrentProfile,
  logoutCurrentUser,
} from "../../store/profile/profileThunk";
import { selectCustomerProfile } from "../../store/users/userSelectors";
import {
  logout,
  updateCustomerProfile,
  updateProfile,
  updateWorkerProfile,
} from "../../store/users/userSlices";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const apiProfile = useAppSelector(selectCurrentWorkerProfile);
  const user =
    useAppSelector(selectCurrentUser) ?? useAppSelector(selectApiAuthUser);
  const isWorker = user?.role.toUpperCase() === "WORKER";
  const isCustomer = user?.role.toUpperCase() === "CUSTOMER";
  const workerCategories = apiProfile?.categories ?? [];
  const workerProfile = apiProfile
    ? {
        id: user?.id ?? "",
        profession:
          workerCategories.map((category) => category.nameEn).join(", ") ||
          "Worker",
        category: workerCategories[0]?.slug ?? "",
        rating: Number(apiProfile.average_rating ?? 0),
        totalJobs: apiProfile.bookingRequests?.length ?? 0,
        verified: apiProfile.approval_status === "APPROVED",
        location:
          apiProfile.district || apiProfile.city || apiProfile.venue
            ? {
                district: apiProfile.district ?? "",
                city: apiProfile.city ?? "",
                address: apiProfile.venue ?? undefined,
              }
            : undefined,
        services: workerCategories.map((category) => ({
          id: category.id,
          name: category.nameEn,
          description: undefined,
          price: undefined,
          duration: undefined,
        })),
        experience: apiProfile.experience_years ?? 0,
        hourlyRate: undefined as number | undefined,
        availability: apiProfile.availability_status
          ? {
              status: apiProfile.availability_status.toLowerCase() as
                | "available"
                | "busy"
                | "unavailable",
              schedule: [],
            }
          : undefined,
        description: apiProfile.bio ?? undefined,
        skills: workerCategories.map((category) => category.nameEn),
      }
    : null;
  const customerProfile = useAppSelector(selectCustomerProfile);
  const isLoading = useAppSelector(selectProfileLoading);
  const avatar = user?.avatarPath ?? undefined;
  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";
  const userPhone = user?.phone;
  const userRole = user?.role ?? null;

  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    profession: workerProfile?.profession || "",
    description: workerProfile?.description || "",
    hourlyRate: workerProfile?.hourlyRate?.toString() || "",
  });

  useEffect(() => {
    dispatch(fetchCurrentProfile());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchCurrentProfile()).unwrap();
    } catch {
      // Keep the last loaded profile visible if refresh fails.
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t("profile.logoutConfirmTitle"),
      t("profile.logoutConfirmBody"),
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("profile.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(logoutCurrentUser()).unwrap();
              await dispatch(logout()).unwrap();
              router.replace("/(public)/(tabs)/home");
            } catch (error) {
              Alert.alert(
                t("profile.error"),
                typeof error === "string"
                  ? error
                  : "Unable to sign out. Please try again.",
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const LANGUAGE_KEY = "appLanguage";

  const openLanguageModal = () => setLangModalVisible(true);

  const changeLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      await i18n.changeLanguage(lang);
      setCurrentLang(lang);

      // persist to customer profile preferences if available
      if (isCustomer && customerProfile) {
        dispatch(
          updateCustomerProfile({
            customerId: customerProfile.id,
            data: {
              preferences: {
                ...customerProfile.preferences,
                language: lang,
              },
            },
          }),
        );
      }
    } catch (e) {
      // ignore
    } finally {
      setLangModalVisible(false);
    }
  };

  const handleEditProfile = () => {
    setEditData({
      name: user?.name || "",
      phone: user?.phone || "",
      profession: workerProfile?.profession || "",
      description: workerProfile?.description || "",
      hourlyRate: workerProfile?.hourlyRate?.toString() || "",
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Update user profile
      await dispatch(
        updateProfile({
          userId: user!.id,
          data: {
            name: editData.name,
            phone: editData.phone,
          },
        }),
      ).unwrap();

      // Update worker profile if worker
      if (isWorker && workerProfile) {
        await dispatch(
          updateWorkerProfile({
            workerId: workerProfile.id,
            data: {
              profession: editData.profession,
              description: editData.description,
              hourlyRate: editData.hourlyRate
                ? parseFloat(editData.hourlyRate)
                : undefined,
            },
          }),
        ).unwrap();
      }

      setEditModalVisible(false);
      Alert.alert(t("profile.success"), t("profile.profileUpdated"));
    } catch (error) {
      Alert.alert(t("profile.error"), t("profile.profileUpdateFailed"));
    }
  };

  const renderCustomerProfile = () => (
    <View style={styles.profileContent}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {customerProfile?.totalJobsPosted || 0}
              </Text>
              <Text style={styles.statLabel}>{t("profile.jobsPosted")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                Rs. {customerProfile?.totalSpent?.toLocaleString() || 0}
              </Text>
              <Text style={styles.statLabel}>{t("profile.totalSpent")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {customerProfile?.averageRating?.toFixed(1) || "0.0"}
              </Text>
              <Text style={styles.statLabel}>{t("profile.rating")}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {customerProfile?.address && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="location-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>{t("profile.address")}</Text>
            </View>
            <Text style={styles.infoText}>
              {customerProfile.address.street}
            </Text>
            <Text style={styles.infoText}>
              {customerProfile.address.city}, {customerProfile.address.district}
            </Text>
          </Card.Content>
        </Card>
      )}

      {customerProfile?.preferences?.categories && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="star-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>
                {t("profile.preferredCategories")}
              </Text>
            </View>
            <View style={styles.chipContainer}>
              {customerProfile.preferences.categories.map((category) => (
                <Chip key={category} style={styles.chip}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <Ionicons name="notifications-outline" size={24} color="#FF6B35" />
            <Text style={styles.infoTitle}>{t("profile.preferences")}</Text>
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>
              {t("profile.pushNotifications")}
            </Text>
            <Switch
              value={customerProfile?.preferences?.notifications ?? true}
              onValueChange={(value) => {
                // Update notification preference
                dispatch(
                  updateCustomerProfile({
                    customerId: customerProfile!.id,
                    data: {
                      preferences: {
                        ...customerProfile?.preferences,
                        notifications: value,
                      },
                    },
                  }),
                );
              }}
              trackColor={{ false: "#D1D5DB", true: "#FF6B35" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>{t("profile.language")}</Text>
            <TouchableOpacity
              onPress={openLanguageModal}
              style={{ paddingHorizontal: 8 }}
            >
              <Text style={styles.preferenceValue}>
                {customerProfile?.preferences?.language ||
                  currentLang ||
                  t("common.english")}
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      {/* Language selection modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { padding: 16 }]}>
            <Text style={[styles.modalTitle, { marginBottom: 12 }]}>
              {" "}
              {t("common.language")}{" "}
            </Text>
            <TouchableOpacity
              style={{ paddingVertical: 12 }}
              onPress={() => changeLanguage("en")}
            >
              <Text style={{ fontSize: 16 }}>{t("common.english")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingVertical: 12 }}
              onPress={() => changeLanguage("si")}
            >
              <Text style={{ fontSize: 16 }}>{t("common.sinhala")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingVertical: 12, marginTop: 8 }}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={{ color: "#9CA3AF" }}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderWorkerProfile = () => (
    <View style={styles.profileContent}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {workerProfile?.totalJobs || 0}
              </Text>
              <Text style={styles.statLabel}>{t("profile.jobsDone")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {workerProfile?.rating?.toFixed(1) || "0.0"}
              </Text>
              <Text style={styles.statLabel}>{t("profile.rating")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {workerProfile?.experience || 0}+
              </Text>
              <Text style={styles.statLabel}>{t("profile.years")}</Text>
            </View>
          </View>
          {workerProfile?.verified && (
            <View style={styles.verifiedBadgeContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.verifiedBadgeText}>
                {t("profile.verifiedProfessional")}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {workerProfile?.location && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="location-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>
                {t("profile.serviceLocation")}
              </Text>
            </View>
            <Text style={styles.infoText}>
              {workerProfile.location.address || ""}
            </Text>
            <Text style={styles.infoText}>
              {workerProfile.location.city}, {workerProfile.location.district}
            </Text>
          </Card.Content>
        </Card>
      )}

      {workerProfile?.services && workerProfile.services.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="construct-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>{t("profile.services")}</Text>
            </View>
            {workerProfile.services.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  {service.price && (
                    <Text style={styles.servicePrice}>Rs. {service.price}</Text>
                  )}
                </View>
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
                <Divider style={styles.serviceDivider} />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {workerProfile?.availability && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="time-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>{t("profile.availability")}</Text>
            </View>
            <View style={styles.availabilityStatus}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      workerProfile.availability.status === "available"
                        ? "#34C759"
                        : workerProfile.availability.status === "busy"
                          ? "#FF9500"
                          : "#FF3B30",
                  },
                ]}
              />
              <Text style={styles.availabilityText}>
                {workerProfile.availability.status.charAt(0).toUpperCase() +
                  workerProfile.availability.status.slice(1)}
              </Text>
            </View>
            {workerProfile.availability.schedule?.map((schedule, index) => (
              <Text key={index} style={styles.scheduleText}>
                {schedule}
              </Text>
            ))}
          </Card.Content>
        </Card>
      )}

      {workerProfile?.skills && workerProfile.skills.length > 0 && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="bulb-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>{t("profile.skills")}</Text>
            </View>
            <View style={styles.chipContainer}>
              {workerProfile.skills.map((skill) => (
                <Chip key={skill} style={styles.chip}>
                  {skill}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {workerProfile?.description && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#FF6B35"
              />
              <Text style={styles.infoTitle}>{t("profile.aboutMe")}</Text>
            </View>
            <Text style={styles.descriptionText}>
              {workerProfile.description}
            </Text>
          </Card.Content>
        </Card>
      )}

      {!!apiProfile?.experiences?.length && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="briefcase-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>Work Experience</Text>
            </View>
            {apiProfile.experiences.map((experience) => (
              <View key={experience.id} style={styles.serviceItem}>
                <Text style={styles.serviceName}>
                  {experience.jobTitle} · {experience.companyName}
                </Text>
                <Text style={styles.serviceDescription}>
                  {experience.startDate.slice(0, 10)} -{" "}
                  {experience.isCurrent
                    ? "Present"
                    : (experience.endDate?.slice(0, 10) ?? "")}
                </Text>
                {!!experience.description && (
                  <Text style={styles.serviceDescription}>
                    {experience.description}
                  </Text>
                )}
                <Divider style={styles.serviceDivider} />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {!!apiProfile?.education?.length && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="school-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>Education</Text>
            </View>
            {apiProfile.education.map((education) => (
              <View key={education.id} style={styles.serviceItem}>
                <Text style={styles.serviceName}>
                  {education.qualification}
                </Text>
                <Text style={styles.serviceDescription}>
                  {education.institution}
                </Text>
                {!!education.description && (
                  <Text style={styles.serviceDescription}>
                    {education.description}
                  </Text>
                )}
                <Divider style={styles.serviceDivider} />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {!!apiProfile?.portfolio?.length && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Ionicons name="images-outline" size={24} color="#FF6B35" />
              <Text style={styles.infoTitle}>Portfolio</Text>
            </View>
            {apiProfile.portfolio.map((item) => (
              <View key={item.id} style={styles.serviceItem}>
                <Text style={styles.serviceName}>{item.title}</Text>
                {!!item.description && (
                  <Text style={styles.serviceDescription}>
                    {item.description}
                  </Text>
                )}
                <Divider style={styles.serviceDivider} />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            {/* <Ionicons name="arrow-back" size={24} color="#1F2937" /> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("profile.myProfile")}</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatar || "https://i.pravatar.cc/300" }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
        {userPhone && <Text style={styles.userPhone}>{userPhone}</Text>}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {userRole
              ? userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || "User"
              : "User"}
          </Text>
        </View>
        {isWorker && workerProfile && (
          <View style={styles.professionContainer}>
            <Text style={styles.professionText}>
              {workerProfile.profession}
            </Text>
            {workerProfile.hourlyRate && (
              <Text style={styles.hourlyRateText}>
                Rs. {workerProfile.hourlyRate}/hour
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Stats and Details */}
      {isCustomer && renderCustomerProfile()}
      {isWorker && renderWorkerProfile()}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={20} color="#FF6B35" />
          <Text style={styles.actionButtonText}>{t("profile.edit")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={openLanguageModal}
        >
          <Ionicons name="settings-outline" size={20} color="#FF6B35" />
          <Text style={styles.actionButtonText}>{t("profile.settings")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      </View>
      <LanguageSelector
        visible={langModalVisible}
        currentLanguage={currentLang}
        onClose={() => setLangModalVisible(false)}
        onChangeLanguage={changeLanguage}
      />

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("profile.editProfile")}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("profile.name")}</Text>
                <TextInput
                  style={styles.input}
                  value={editData.name}
                  onChangeText={(text) =>
                    setEditData({ ...editData, name: text })
                  }
                  placeholder={t("profile.name")}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("profile.phone")}</Text>
                <TextInput
                  style={styles.input}
                  value={editData.phone}
                  onChangeText={(text) =>
                    setEditData({ ...editData, phone: text })
                  }
                  placeholder={t("profile.phone")}
                  keyboardType="phone-pad"
                />
              </View>

              {isWorker && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {t("profile.profession")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={editData.profession}
                      onChangeText={(text) =>
                        setEditData({ ...editData, profession: text })
                      }
                      placeholder={t("profile.profession")}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {t("profile.description")}
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={editData.description}
                      onChangeText={(text) =>
                        setEditData({ ...editData, description: text })
                      }
                      placeholder={t("profile.description")}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {t("profile.hourlyRate")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={editData.hourlyRate}
                      onChangeText={(text) =>
                        setEditData({ ...editData, hourlyRate: text })
                      }
                      placeholder={t("profile.hourlyRate")}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}

              <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={styles.saveButton}
                loading={isLoading}
                disabled={isLoading}
              >
                {t("profile.saveChanges")}
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B35",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "600",
  },
  professionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  professionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  hourlyRateText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
  },
  profileContent: {
    paddingHorizontal: 20,
  },
  statsCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  verifiedBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  verifiedBadgeText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#FFF5F0",
    borderColor: "#FF6B35",
    borderWidth: 1,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: "#1F2937",
  },
  preferenceValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  serviceItem: {
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  serviceDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  serviceDivider: {
    marginTop: 12,
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
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  scheduleText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    marginTop: 8,
    borderRadius: 8,
  },
});
