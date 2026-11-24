import {
  selectIsLoadingMyWorkerJobRequests,
  selectMyWorkerJobRequests,
  selectMyWorkerJobRequestsError,
  selectUpdatingWorkerQuotationJobId,
  selectWithdrawingWorkerQuotationJobId,
  selectWorkerQuotationError,
} from "@/app/store/workers/workerSelectors";
import { clearWorkerQuotationError } from "@/app/store/workers/workerSlice";
import {
  editWorkerQuotation,
  fetchMyWorkerJobRequests,
  WorkerJobRequestSummary,
  withdrawWorkerQuotation,
} from "@/app/store/workers/workerThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import Header from "@/components/Splash/commonComponents/Header";
import ProfileDatePicker from "@/components/ProfileDatePicker";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip } from "react-native-paper";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");

function getTodayDateString() {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDate(value: string) {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value,
  );
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function formatBudget(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `LKR ${amount.toLocaleString()}`
    : `LKR ${value}`;
}

function avatarUri(path?: string | null) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

function statusColor(status: string) {
  switch (status.toUpperCase()) {
    case "ACCEPTED":
      return "#16A34A";
    case "REJECTED":
      return "#DC2626";
    default:
      return "#D97706";
  }
}

export default function WorkerJobRequestsScreen() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(selectMyWorkerJobRequests);
  const isLoading = useAppSelector(selectIsLoadingMyWorkerJobRequests);
  const error = useAppSelector(selectMyWorkerJobRequestsError);
  const updatingJobId = useAppSelector(selectUpdatingWorkerQuotationJobId);
  const withdrawingJobId = useAppSelector(
    selectWithdrawingWorkerQuotationJobId,
  );
  const quotationError = useAppSelector(selectWorkerQuotationError);
  const [refreshing, setRefreshing] = useState(false);
  const [editingRequest, setEditingRequest] =
    useState<WorkerJobRequestSummary | null>(null);
  const [proposedBudget, setProposedBudget] = useState("");
  const [message, setMessage] = useState("");
  const [proposedDate, setProposedDate] = useState(getTodayDateString);
  const [formError, setFormError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    await dispatch(fetchMyWorkerJobRequests());
  }, [dispatch]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const refreshRequests = async () => {
    setRefreshing(true);
    try {
      await loadRequests();
    } finally {
      setRefreshing(false);
    }
  };

  const openEditForm = (item: WorkerJobRequestSummary) => {
    setEditingRequest(item);
    setProposedBudget(String(item.request.proposedBudget));
    setMessage(item.request.message);
    setProposedDate(item.request.proposedDate);
    setFormError(null);
    dispatch(clearWorkerQuotationError());
  };

  const closeEditForm = () => {
    if (updatingJobId === null) {
      setEditingRequest(null);
    }
  };

  const saveEditedRequest = async () => {
    const budget = Number(proposedBudget);
    if (!Number.isFinite(budget) || budget <= 0) {
      setFormError("Enter a budget greater than zero.");
      return;
    }
    if (!message.trim()) {
      setFormError("Add a message explaining your quotation.");
      return;
    }
    if (!proposedDate) {
      setFormError("Select your proposed date.");
      return;
    }
    if (!editingRequest) return;

    setFormError(null);
    const result = await dispatch(
      editWorkerQuotation({
        jobId: editingRequest.jobId,
        quotation: {
          proposedBudget: budget,
          message: message.trim(),
          proposedDate,
        },
      }),
    );
    if (editWorkerQuotation.fulfilled.match(result)) {
      setEditingRequest(null);
      Alert.alert("Quotation updated", "Your quotation has been updated.");
    }
  };

  const confirmWithdraw = (item: WorkerJobRequestSummary) => {
    Alert.alert(
      "Withdraw quotation?",
      "Your quotation will be marked as withdrawn. You can submit a new quotation later if the job is still open.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => {
            void dispatch(withdrawWorkerQuotation(item.jobId))
              .unwrap()
              .then(() =>
                Alert.alert(
                  "Quotation withdrawn",
                  "Your quotation has been withdrawn.",
                ),
              )
              .catch((withdrawError: unknown) =>
                Alert.alert(
                  "Unable to withdraw quotation",
                  withdrawError instanceof Error
                    ? withdrawError.message
                    : "Please try again.",
                ),
              );
          },
        },
      ],
    );
  };

  if (isLoading && requests.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="My Job Requests" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading your job requests...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Job Requests" />
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => void refreshRequests()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.request.id}
        contentContainerStyle={[
          styles.list,
          requests.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshRequests}
          />
        }
        renderItem={({ item }) => {
          const request = item.request;
          const workerAvatar = avatarUri(request.workerAvatarPath);
          const requestStatusColor = statusColor(request.status);
          const canEditOrWithdraw =
            request.status.toUpperCase() === "PENDING" &&
            item.jobStatus?.toUpperCase() === "OPEN";
          const isUpdating = updatingJobId === item.jobId;
          const isWithdrawing = withdrawingJobId === item.jobId;

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.jobHeader}>
                  <View style={styles.jobIcon}>
                    <Ionicons
                      name="briefcase-outline"
                      size={20}
                      color="#FF6B35"
                    />
                  </View>
                  <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { borderColor: requestStatusColor },
                    ]}
                    textStyle={[
                      styles.statusText,
                      { color: requestStatusColor },
                    ]}
                  >
                    {request.status.replaceAll("_", " ")}
                  </Chip>
                </View>

                <View style={styles.workerHeader}>
                  <View style={styles.avatar}>
                    {workerAvatar ? (
                      <Image
                        source={{ uri: workerAvatar }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Ionicons name="person" size={22} color="#FF6B35" />
                    )}
                  </View>
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName}>{request.workerName}</Text>
                    <View style={styles.rating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingText}>
                        {request.averageRating ?? "New"}
                        {request.reviewCount != null
                          ? ` (${request.reviewCount} reviews)`
                          : ""}
                      </Text>
                    </View>
                    {request.experienceYears != null ? (
                      <Text style={styles.experience}>
                        {request.experienceYears} years of experience
                      </Text>
                    ) : null}
                  </View>
                </View>

                {request.workerBio ? (
                  <Text style={styles.bio}>{request.workerBio}</Text>
                ) : null}

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proposed budget</Text>
                    <Text style={styles.budget}>
                      {formatBudget(request.proposedBudget)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proposed date</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(request.proposedDate)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.messageLabel}>Your message</Text>
                <Text style={styles.message}>{request.message}</Text>

                {canEditOrWithdraw ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      disabled={updatingJobId !== null || withdrawingJobId !== null}
                      style={styles.editButton}
                      onPress={() => openEditForm(item)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={17}
                        color="#FF6B35"
                      />
                      <Text style={styles.editButtonText}>
                        {isUpdating ? "Updating..." : "Edit Quotation"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      disabled={updatingJobId !== null || withdrawingJobId !== null}
                      style={[
                        styles.withdrawButton,
                        isWithdrawing && styles.disabledButton,
                      ]}
                      onPress={() => confirmWithdraw(item)}
                    >
                      {isWithdrawing ? (
                        <ActivityIndicator size="small" color="#DC2626" />
                      ) : (
                        <Ionicons
                          name="close-circle-outline"
                          size={17}
                          color="#DC2626"
                        />
                      )}
                      <Text style={styles.withdrawButtonText}>
                        {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color="#D1D5DB"
              />
              <Text style={styles.emptyTitle}>No job requests yet</Text>
              <Text style={styles.emptyText}>
                Quotations you submit for jobs will appear here.
              </Text>
            </View>
          ) : null
        }
      />
      <Modal
        transparent
        animationType="slide"
        visible={editingRequest !== null}
        onRequestClose={closeEditForm}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Quotation</Text>
                <TouchableOpacity
                  accessibilityLabel="Close edit quotation form"
                  disabled={updatingJobId !== null}
                  onPress={closeEditForm}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {editingRequest ? (
                <Text style={styles.modalJobTitle} numberOfLines={2}>
                  {editingRequest.jobTitle}
                </Text>
              ) : null}

              <Text style={styles.inputLabel}>Proposed budget (LKR)</Text>
              <TextInput
                accessibilityLabel="Proposed budget"
                style={styles.input}
                value={proposedBudget}
                onChangeText={setProposedBudget}
                keyboardType="decimal-pad"
                placeholder="e.g. 16500"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                accessibilityLabel="Quotation message"
                style={[styles.input, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
                textAlignVertical="top"
                placeholder="Describe how you can complete this job"
                placeholderTextColor="#9CA3AF"
              />

              <ProfileDatePicker
                label="Proposed date"
                value={proposedDate}
                onChange={setProposedDate}
                minimumDate={getStartOfToday()}
              />

              {(formError || quotationError) ? (
                <Text style={styles.formError}>
                  {formError || quotationError}
                </Text>
              ) : null}

              <TouchableOpacity
                accessibilityRole="button"
                disabled={updatingJobId !== null}
                style={[
                  styles.saveButton,
                  updatingJobId !== null && styles.disabledButton,
                ]}
                onPress={() => void saveEditedRequest()}
              >
                {updatingJobId !== null ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                )}
                <Text style={styles.saveButtonText}>
                  {updatingJobId !== null ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 12,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  jobHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  jobIcon: {
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  jobTitle: {
    color: "#1F2937",
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  statusChip: {
    backgroundColor: "#FFFFFF",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  workerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    width: 48,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
  },
  rating: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    color: "#6B7280",
    fontSize: 12,
  },
  experience: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 3,
  },
  bio: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  details: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
    marginTop: 14,
    paddingVertical: 12,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 13,
  },
  detailValue: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "600",
  },
  budget: {
    color: "#FF6B35",
    fontSize: 15,
    fontWeight: "700",
  },
  messageLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
  },
  message: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },
  actions: {
    alignItems: "center",
    borderTopColor: "#E5E7EB",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
  },
  editButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  editButtonText: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: "600",
  },
  withdrawButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  withdrawButtonText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
  },
  modalJobTitle: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
  },
  inputLabel: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    borderWidth: 1,
    color: "#111827",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageInput: {
    minHeight: 100,
  },
  formError: {
    color: "#B91C1C",
    fontSize: 13,
    marginTop: 12,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    height: 50,
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  errorText: {
    color: "#B91C1C",
    flex: 1,
    fontSize: 13,
    marginRight: 12,
  },
  retryText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "700",
  },
});
