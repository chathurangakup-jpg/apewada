import DistrictDropdown from "@/components/DistrictDropdown";
import ProfileDatePicker from "@/components/ProfileDatePicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { HomeCategory } from "../../../store/home/homeServices";
import { fetchHomeData } from "../../../store/home/homeThunk";
import { selectHomeState } from "../../../store/home/homeSelector";
import {
  selectProfileLoading,
  selectProfileUpdating,
} from "../../../store/profile/profileSelector";
import {
  CurrentUserProfile,
  CurrentWorkerProfile,
  CustomerProfile,
  WorkerEducationRecord,
  WorkerExperienceRecord,
  WorkerPortfolioRecord,
} from "../../../store/profile/profileServices";
import {
  fetchCurrentProfile,
  updateCustomerProfile,
  updateWorkerProfile,
} from "../../../store/profile/profileThunk";

interface ProfileEditData {
  address: string;
  district: string;
  city: string;
  venue: string;
  bio: string;
  experienceYears: string;
  educationSummary: string;
  categoryIds: string[];
  experiences: WorkerExperienceRecord[];
  education: WorkerEducationRecord[];
  portfolio: WorkerPortfolioRecord[];
}

const emptyEditData: ProfileEditData = {
  address: "",
  district: "",
  city: "",
  venue: "",
  bio: "",
  experienceYears: "",
  educationSummary: "",
  categoryIds: [],
  experiences: [],
  education: [],
  portfolio: [],
};

const dateForInput = (value?: string | null) => value?.slice(0, 10) ?? "";

const isValidDateInput = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const dateForPicker = (value?: string | null) => {
  if (!value || !isValidDateInput(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getInitialEditData = ({
  user,
  profile,
}: CurrentUserProfile): ProfileEditData => {
  const isWorker = user.role.toUpperCase() === "WORKER";
  const workerProfile = isWorker
    ? (profile as CurrentWorkerProfile | null)
    : null;
  const customerProfile = isWorker
    ? null
    : (profile as CustomerProfile | null);

  return {
    address: customerProfile?.address ?? "",
    district: (workerProfile?.district ?? customerProfile?.district) ?? "",
    city: (workerProfile?.city ?? customerProfile?.city) ?? "",
    venue: (workerProfile?.venue ?? customerProfile?.venue) ?? "",
    bio: workerProfile?.bio ?? "",
    experienceYears: String(
      workerProfile?.experienceYears ?? workerProfile?.experience_years ?? "",
    ),
    educationSummary:
      workerProfile?.educationSummary ??
      workerProfile?.education_summary ??
      "",
    categoryIds: workerProfile?.categories?.map(({ id }) => id) ?? [],
    experiences:
      workerProfile?.experiences?.map((experience) => ({
        ...experience,
        startDate: dateForInput(experience.startDate),
        endDate: dateForInput(experience.endDate),
      })) ?? [],
    education:
      workerProfile?.education?.map((education) => ({
        ...education,
        startDate: dateForInput(education.startDate),
        endDate: dateForInput(education.endDate),
      })) ?? [],
    portfolio:
      workerProfile?.portfolio?.map((item) => ({
        ...item,
        completedAt: dateForInput(item.completedAt),
      })) ?? [],
  };
};

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const [currentProfile, setCurrentProfile] =
    useState<CurrentUserProfile | null>(null);
  const isWorker = currentProfile?.user.role.toUpperCase() === "WORKER";
  const isCustomer = currentProfile?.user.role.toUpperCase() === "CUSTOMER";
  const isLoading = useAppSelector(selectProfileLoading);
  const isUpdating = useAppSelector(selectProfileUpdating);
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useAppSelector(selectHomeState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editData, setEditData] = useState<ProfileEditData>(emptyEditData);

  useEffect(() => {
    let isActive = true;

    dispatch(fetchCurrentProfile())
      .unwrap()
      .then((profile) => {
        if (!isActive) return;
        setCurrentProfile(profile);
        setEditData(getInitialEditData(profile));
        setIsInitialized(true);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : "Unable to load your profile.",
        );
        setIsInitialized(true);
      });

    return () => {
      isActive = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchHomeData());
    }
  }, [categories.length, dispatch]);

  const setField = (field: keyof ProfileEditData, value: string) => {
    setEditData((current) => ({ ...current, [field]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setEditData((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  };

  const updateExperience = (
    index: number,
    changes: Partial<WorkerExperienceRecord>,
  ) => {
    setEditData((current) => ({
      ...current,
      experiences: current.experiences.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    }));
  };

  const updateEducation = (
    index: number,
    changes: Partial<WorkerEducationRecord>,
  ) => {
    setEditData((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    }));
  };

  const updatePortfolio = (
    index: number,
    changes: Partial<WorkerPortfolioRecord>,
  ) => {
    setEditData((current) => ({
      ...current,
      portfolio: current.portfolio.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (isCustomer) {
        await dispatch(
          updateCustomerProfile({
            address: editData.address.trim(),
            district: editData.district.trim(),
            city: editData.city.trim(),
            venue: editData.venue.trim(),
          }),
        ).unwrap();
      } else if (isWorker) {
        const experienceYears = Number(editData.experienceYears);
        if (
          !editData.experienceYears.trim() ||
          !Number.isInteger(experienceYears) ||
          experienceYears < 0
        ) {
          Alert.alert(t("profile.error"), t("profile.invalidExperienceYears"));
          return;
        }

        const experiences = editData.experiences
          .filter(
            (item) =>
              item.companyName.trim() ||
              item.jobTitle.trim() ||
              item.description?.trim() ||
              item.startDate.trim() ||
              item.endDate?.trim(),
          )
          .map(({ id: _id, ...item }) => ({
            companyName: item.companyName.trim(),
            jobTitle: item.jobTitle.trim(),
            description: item.description?.trim() || "",
            startDate: item.startDate.trim(),
            endDate: item.isCurrent ? null : item.endDate?.trim() || null,
            isCurrent: item.isCurrent,
          }));
        const education = editData.education
          .filter(
            (item) =>
              item.institution.trim() ||
              item.qualification.trim() ||
              item.description?.trim() ||
              item.startDate?.trim() ||
              item.endDate?.trim(),
          )
          .map(({ id: _id, ...item }) => ({
            institution: item.institution.trim(),
            qualification: item.qualification.trim(),
            description: item.description?.trim() || "",
            startDate: item.startDate?.trim() || undefined,
            endDate: item.endDate?.trim() || null,
          }));
        const portfolio = editData.portfolio
          .filter(
            (item) =>
              item.title.trim() ||
              item.description?.trim() ||
              item.completedAt?.trim(),
          )
          .map(({ id: _id, ...item }) => ({
            title: item.title.trim(),
            description: item.description?.trim() || "",
            completedAt: item.completedAt?.trim() || undefined,
          }));

        if (
          experiences.some(
            (item) =>
              !item.companyName ||
              !item.jobTitle ||
              !isValidDateInput(item.startDate) ||
              (!item.isCurrent &&
                (!item.endDate || !isValidDateInput(item.endDate))),
          )
        ) {
          Alert.alert(t("profile.error"), t("profile.completeExperienceDates"));
          return;
        }

        if (
          education.some(
            (item) =>
              !item.institution ||
              !item.qualification ||
              (!!item.startDate && !isValidDateInput(item.startDate)) ||
              (!!item.endDate && !isValidDateInput(item.endDate)),
          ) ||
          portfolio.some(
            (item) =>
              !item.title ||
              (!!item.completedAt && !isValidDateInput(item.completedAt)),
          )
        ) {
          Alert.alert(
            t("profile.error"),
            t("profile.completeEducationPortfolio"),
          );
          return;
        }

        if (
          experiences.some(
            (item) =>
              !item.isCurrent &&
              isValidDateInput(item.startDate) &&
              !!item.endDate &&
              isValidDateInput(item.endDate) &&
              item.startDate > item.endDate,
          ) ||
          education.some(
            (item) =>
              !!item.startDate &&
              !!item.endDate &&
              isValidDateInput(item.startDate) &&
              isValidDateInput(item.endDate) &&
              item.startDate > item.endDate,
          )
        ) {
          Alert.alert(t("profile.error"), t("profile.invalidDateRange"));
          return;
        }

        await dispatch(
          updateWorkerProfile({
            bio: editData.bio.trim(),
            experienceYears,
            educationSummary: editData.educationSummary.trim(),
            district: editData.district.trim(),
            city: editData.city.trim(),
            venue: editData.venue.trim(),
            categoryIds: editData.categoryIds,
            experiences,
            education,
            portfolio,
          }),
        ).unwrap();
      } else {
        throw new Error("Unable to determine the profile type.");
      }

      Alert.alert(t("profile.success"), t("profile.profileUpdated"));
      router.back();
    } catch (error) {
      Alert.alert(
        t("profile.error"),
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : t("profile.profileUpdateFailed"),
      );
    }
  };

  const renderEditField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options: { multiline?: boolean; keyboardType?: "default" | "numeric" } = {},
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, options.multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        multiline={options.multiline}
        keyboardType={options.keyboardType}
      />
    </View>
  );

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadError}>{loadError}</Text>
        <Button mode="text" onPress={() => router.back()}>
          {t("common.cancel")}
        </Button>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadError}>{t("profile.profileUpdateFailed")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.editProfile")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        {isCustomer &&
          renderEditField(
            t("profile.address"),
            editData.address,
            (text) => setField("address", text),
            { multiline: true },
          )}

        {(isCustomer || isWorker) && (
          <>
            <DistrictDropdown
              label={t("profile.district")}
              value={editData.district}
              onChange={(district) => setField("district", district)}
              placeholder={t("jobs.selectDistrict")}
              buttonStyle={styles.districtButton}
            />
            {renderEditField(t("profile.city"), editData.city, (text) =>
              setField("city", text),
            )}
            {renderEditField(t("profile.venue"), editData.venue, (text) =>
              setField("venue", text),
            )}
          </>
        )}

        {isWorker && (
          <>
            {renderEditField(
              t("profile.aboutMe"),
              editData.bio,
              (text) => setField("bio", text),
              { multiline: true },
            )}
            {renderEditField(
              t("profile.yearsOfExperience"),
              editData.experienceYears,
              (text) => setField("experienceYears", text),
              { keyboardType: "numeric" },
            )}
            {renderEditField(
              t("profile.educationSummary"),
              editData.educationSummary,
              (text) => setField("educationSummary", text),
              { multiline: true },
            )}
            <View style={styles.editSection}>
              <Text style={styles.editSectionTitle}>
                {t("profile.categories")}
              </Text>
              <Text style={styles.categoryHint}>
                {t("profile.selectCategories")}
              </Text>
              {isCategoriesLoading && categories.length === 0 ? (
                <ActivityIndicator color="#FF6B35" />
              ) : categoriesError && categories.length === 0 ? (
                <Text style={styles.loadError}>{categoriesError}</Text>
              ) : categories.length === 0 ? (
                <Text style={styles.categoryHint}>
                  {t("profile.noCategoriesAvailable")}
                </Text>
              ) : (
                <View style={styles.categoryList}>
                  {categories.map((category: HomeCategory) => {
                    const isSelected = editData.categoryIds.includes(
                      category.id,
                    );
                    const categoryName = i18n.resolvedLanguage?.startsWith("si")
                      ? category.nameSi
                      : category.nameEn;

                    return (
                      <TouchableOpacity
                        key={category.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipSelected,
                        ]}
                        onPress={() => toggleCategory(category.id)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextSelected,
                          ]}
                        >
                          {categoryName}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FF6B35"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.editSection}>
              <Text style={styles.editSectionTitle}>
                {t("profile.workExperience")}
              </Text>
              {editData.experiences.map((item, index) => (
                <View key={`experience-${index}`} style={styles.editRecord}>
                  <View style={styles.editRecordHeader}>
                    <Text style={styles.editRecordTitle}>
                      {t("profile.experienceEntry", { count: index + 1 })}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setEditData((current) => ({
                          ...current,
                          experiences: current.experiences.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        }))
                      }
                    >
                      <Text style={styles.removeRecordText}>
                        {t("profile.remove")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {renderEditField(t("profile.company"), item.companyName, (text) =>
                    updateExperience(index, { companyName: text }),
                  )}
                  {renderEditField(t("profile.jobTitle"), item.jobTitle, (text) =>
                    updateExperience(index, { jobTitle: text }),
                  )}
                  {renderEditField(
                    t("profile.description"),
                    item.description ?? "",
                    (text) => updateExperience(index, { description: text }),
                    { multiline: true },
                  )}
                  <ProfileDatePicker
                    label={t("profile.startDateFormat")}
                    value={item.startDate}
                    maximumDate={dateForPicker(item.endDate)}
                    onChange={(startDate) =>
                      updateExperience(index, { startDate })
                    }
                  />
                  {!item.isCurrent &&
                    <ProfileDatePicker
                      label={t("profile.endDateFormat")}
                      value={item.endDate ?? ""}
                      minimumDate={dateForPicker(item.startDate)}
                      onChange={(endDate) =>
                        updateExperience(index, { endDate })
                      }
                    />}
                  <View style={styles.preferenceRow}>
                    <Text style={styles.preferenceLabel}>
                      {t("profile.currentPosition")}
                    </Text>
                    <Switch
                      value={item.isCurrent}
                      onValueChange={(value) =>
                        updateExperience(index, {
                          isCurrent: value,
                          endDate: value ? null : item.endDate,
                        })
                      }
                      trackColor={{ false: "#D1D5DB", true: "#FF6B35" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addRecordButton}
                onPress={() =>
                  setEditData((current) => ({
                    ...current,
                    experiences: [
                      ...current.experiences,
                      {
                        companyName: "",
                        jobTitle: "",
                        description: "",
                        startDate: "",
                        endDate: null,
                        isCurrent: false,
                      },
                    ],
                  }))
                }
              >
                <Text style={styles.addRecordText}>
                  + {t("profile.addExperience")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.editSectionTitle}>
                {t("profile.education")}
              </Text>
              {editData.education.map((item, index) => (
                <View key={`education-${index}`} style={styles.editRecord}>
                  <View style={styles.editRecordHeader}>
                    <Text style={styles.editRecordTitle}>
                      {t("profile.educationEntry", { count: index + 1 })}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setEditData((current) => ({
                          ...current,
                          education: current.education.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        }))
                      }
                    >
                      <Text style={styles.removeRecordText}>
                        {t("profile.remove")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {renderEditField(
                    t("profile.institution"),
                    item.institution,
                    (text) => updateEducation(index, { institution: text }),
                  )}
                  {renderEditField(
                    t("profile.qualification"),
                    item.qualification,
                    (text) => updateEducation(index, { qualification: text }),
                  )}
                  {renderEditField(
                    t("profile.description"),
                    item.description ?? "",
                    (text) => updateEducation(index, { description: text }),
                    { multiline: true },
                  )}
                  <ProfileDatePicker
                    label={t("profile.startDateFormat")}
                    value={item.startDate ?? ""}
                    maximumDate={dateForPicker(item.endDate)}
                    onChange={(startDate) =>
                      updateEducation(index, { startDate })
                    }
                  />
                  <ProfileDatePicker
                    label={t("profile.endDateFormat")}
                    value={item.endDate ?? ""}
                    minimumDate={dateForPicker(item.startDate)}
                    onChange={(endDate) => updateEducation(index, { endDate })}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.addRecordButton}
                onPress={() =>
                  setEditData((current) => ({
                    ...current,
                    education: [
                      ...current.education,
                      {
                        institution: "",
                        qualification: "",
                        description: "",
                        startDate: "",
                        endDate: null,
                      },
                    ],
                  }))
                }
              >
                <Text style={styles.addRecordText}>
                  + {t("profile.addEducation")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.editSectionTitle}>
                {t("profile.portfolio")}
              </Text>
              {editData.portfolio.map((item, index) => (
                <View key={`portfolio-${index}`} style={styles.editRecord}>
                  <View style={styles.editRecordHeader}>
                    <Text style={styles.editRecordTitle}>
                      {t("profile.project", { count: index + 1 })}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setEditData((current) => ({
                          ...current,
                          portfolio: current.portfolio.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        }))
                      }
                    >
                      <Text style={styles.removeRecordText}>
                        {t("profile.remove")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {renderEditField(
                    t("profile.project", { count: index + 1 }),
                    item.title,
                    (text) => updatePortfolio(index, { title: text }),
                  )}
                  {renderEditField(
                    t("profile.description"),
                    item.description ?? "",
                    (text) => updatePortfolio(index, { description: text }),
                    { multiline: true },
                  )}
                  <ProfileDatePicker
                    label={t("profile.completedDateFormat")}
                    value={item.completedAt ?? ""}
                    onChange={(completedAt) =>
                      updatePortfolio(index, { completedAt })
                    }
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.addRecordButton}
                onPress={() =>
                  setEditData((current) => ({
                    ...current,
                    portfolio: [
                      ...current.portfolio,
                      { title: "", description: "", completedAt: "" },
                    ],
                  }))
                }
              >
                <Text style={styles.addRecordText}>
                  + {t("profile.addProject")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Button
          mode="contained"
          onPress={handleSaveProfile}
          style={styles.saveButton}
          loading={isUpdating}
          disabled={isUpdating || isLoading}
        >
          {t("profile.saveChanges")}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  loadError: {
    marginHorizontal: 24,
    color: "#B91C1C",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 24,
  },
  form: {
    padding: 20,
    paddingBottom: 40,
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
  districtButton: {
    marginBottom: 16,
  },
  categoryHint: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  categoryChipSelected: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF5F0",
  },
  categoryChipText: {
    color: "#374151",
    fontSize: 14,
  },
  categoryChipTextSelected: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  editSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  editRecord: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
  },
  editRecordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editRecordTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  removeRecordText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
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
  addRecordButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderRadius: 8,
  },
  addRecordText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    marginTop: 8,
    borderRadius: 8,
  },
});
