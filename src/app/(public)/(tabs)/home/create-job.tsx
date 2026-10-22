import {
  selectCustomerJobById,
  selectCustomerJobSubmitting,
} from "@/app/store/customer/customerSelector";
import type {
  CustomerJobDraft,
  CustomerJobUpload,
} from "@/app/store/customer/customerServices";
import {
  editCustomerJob,
  submitCustomerJob,
} from "@/app/store/customer/customerThunk";
import { selectHomeCategories } from "@/app/store/home/homeSelector";
import { fetchHomeData } from "@/app/store/home/homeThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import DistrictDropdown from "@/components/DistrictDropdown";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Chip } from "react-native-paper";

const emptyDraft: CustomerJobDraft = {
  title: "",
  description: "",
  categoryId: "",
  district: "",
  city: "",
  venue: "",
  preferredDate: "",
};

export default function CreateJobScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId?: string | string[] }>();
  const editingJobId = Array.isArray(jobId) ? jobId[0] : jobId;
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectHomeCategories);
  const editingJob = useAppSelector((state) =>
    selectCustomerJobById(state, editingJobId),
  );
  const isSubmitting = useAppSelector(selectCustomerJobSubmitting);
  const [draft, setDraft] = useState<CustomerJobDraft>(emptyDraft);
  const [images, setImages] = useState<CustomerJobUpload[]>([]);

  useEffect(() => {
    if (categories.length === 0) {
      void dispatch(fetchHomeData());
    }
  }, [categories.length, dispatch]);

  useEffect(() => {
    if (!editingJob) {
      return;
    }

    setDraft({
      title: editingJob.title,
      description: editingJob.description,
      categoryId: editingJob.categoryId,
      district: editingJob.district,
      city: editingJob.city,
      venue: editingJob.venue,
      preferredDate: editingJob.preferredDate.slice(0, 10),
    });
  }, [editingJob]);

  const setField = <K extends keyof CustomerJobDraft>(
    field: K,
    value: CustomerJobDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo permission required",
        "Allow photo access to add images to your job.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    setImages((current) => [
      ...current,
      ...result.assets.map((asset, index) => ({
        uri: asset.uri,
        filename: asset.fileName || `job-image-${Date.now()}-${index}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
        fileSize: asset.fileSize || 0,
      })),
    ]);
  };

  const removeImage = (uri: string) => {
    setImages((current) => current.filter((image) => image.uri !== uri));
  };

  const handleSubmit = async () => {
    if (
      !draft.title.trim() ||
      !draft.description.trim() ||
      !draft.categoryId ||
      !draft.district ||
      !draft.city.trim() ||
      !draft.venue.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(draft.preferredDate)
    ) {
      Alert.alert(
        "Complete the job details",
        "Enter all fields and use YYYY-MM-DD for the preferred date.",
      );
      return;
    }

    const normalizedDraft = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      city: draft.city.trim(),
      venue: draft.venue.trim(),
    };

    try {
      if (editingJob) {
        await dispatch(
          editCustomerJob({
            jobId: editingJob.id,
            draft: normalizedDraft,
            images,
            existingImages: editingJob.images.map(
              ({
                storagePath,
                originalFilename,
                mimeType,
                fileSize,
                sortOrder,
              }) => ({
                storagePath,
                originalFilename,
                mimeType,
                fileSize,
                sortOrder,
              }),
            ),
          }),
        ).unwrap();
      } else {
        console.log(
          "Submitting new job with draft:",
          normalizedDraft,
          "and images:",
          images,
        );
        await dispatch(
          submitCustomerJob({ draft: normalizedDraft, images }),
        ).unwrap();
      }

      router.back();
    } catch (error) {
      Alert.alert(
        "Unable to save job",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingJob ? "Edit Job" : "Create a Job"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Describe the work you need so nearby workers can respond.
        </Text>

        <Text style={styles.label}>Job title</Text>
        <TextInput
          value={draft.title}
          onChangeText={(value) => setField("title", value)}
          placeholder="e.g. Repair leaking kitchen pipe"
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={draft.description}
          onChangeText={(value) => setField("description", value)}
          placeholder="Describe the work that needs to be done"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={[styles.input, styles.descriptionInput]}
        />

        <Text style={styles.label}>Service category</Text>
        <View style={styles.categories}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={draft.categoryId === category.id}
              showSelectedCheck
              style={[
                styles.categoryChip,
                draft.categoryId === category.id && styles.selectedCategoryChip,
              ]}
              onPress={() => setField("categoryId", category.id)}
            >
              {category.nameEn}
            </Chip>
          ))}
        </View>

        <DistrictDropdown
          label="District"
          value={draft.district}
          onChange={(value) => setField("district", value)}
          placeholder="Select a district"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          value={draft.city}
          onChangeText={(value) => setField("city", value)}
          placeholder="e.g. Dehiwala"
          style={styles.input}
        />

        <Text style={styles.label}>Venue / address</Text>
        <TextInput
          value={draft.venue}
          onChangeText={(value) => setField("venue", value)}
          placeholder="e.g. 45 Example Road, Dehiwala"
          style={styles.input}
        />

        <Text style={styles.label}>Preferred date</Text>
        <TextInput
          value={draft.preferredDate}
          onChangeText={(value) => setField("preferredDate", value)}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
          style={styles.input}
        />

        <View style={styles.imageHeader}>
          <View>
            <Text style={styles.label}>Job images</Text>
            <Text style={styles.helperText}>
              Add up to five images to help workers understand the job.
            </Text>
          </View>
          <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
            <Ionicons name="images-outline" size={18} color="#FF6B35" />
            <Text style={styles.imageButtonText}>Add images</Text>
          </TouchableOpacity>
        </View>

        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((image) => (
              <View key={image.uri} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.preview} />
                <TouchableOpacity
                  accessibilityLabel={`Remove ${image.filename}`}
                  style={styles.removeImageButton}
                  onPress={() => removeImage(image.uri)}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {editingJob && editingJob.images.length > 0 && (
          <Text style={styles.helperText}>
            {editingJob.images.length} existing image
            {editingJob.images.length === 1 ? "" : "s"} will be retained.
          </Text>
        )}

        <Button
          mode="contained"
          disabled={isSubmitting}
          loading={isSubmitting}
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {editingJob ? "Save Changes" : "Submit Job for Approval"}
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
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    gap: 10,
    padding: 16,
    paddingBottom: 32,
  },
  intro: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  label: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#1F2937",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  descriptionInput: {
    minHeight: 116,
    paddingTop: 12,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#FFFFFF",
  },
  selectedCategoryChip: {
    backgroundColor: "#FFF5F0",
  },
  imageHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  helperText: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
  },
  imageButton: {
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderColor: "#FF6B35",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  imageButtonText: {
    color: "#FF6B35",
    fontSize: 13,
    fontWeight: "600",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  imageWrapper: {
    height: 88,
    position: "relative",
    width: 88,
  },
  preview: {
    borderRadius: 8,
    height: "100%",
    width: "100%",
  },
  removeImageButton: {
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: -6,
    top: -6,
    width: 24,
  },
  submitButton: {
    marginTop: 16,
  },
  submitButtonContent: {
    minHeight: 48,
  },
});
