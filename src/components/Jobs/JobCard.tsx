import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card, Chip } from "react-native-paper";

interface JobCardProps {
  job: any;
  onPress?: () => void;
}

export default function JobCard({ job, onPress }: JobCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.push({
      pathname: "/(public)/(tabs)/home/jobs/[jobId]",
      params: { jobId: String(job.id) },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.wrapper}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {/* LEFT - IMAGE */}
          <Image
            source={{
              uri:
                job.image ||
                job.coverImage ||
                job.images?.[0] ||
                "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
            }}
            style={styles.image}
          />

          {/* RIGHT - DETAILS */}
          <View style={styles.details}>
            {/* Category */}
            <Chip
              mode="outlined"
              style={styles.categoryChip}
              textStyle={styles.categoryText}
            >
              {job.category || "General"}
            </Chip>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {job.title || job.name || "Untitled Job"}
            </Text>

            {/* Description */}
            {job.description && (
              <Text style={styles.description} numberOfLines={2}>
                {job.description}
              </Text>
            )}

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />

              <Text style={styles.location} numberOfLines={1}>
                {job.location?.district || job.district || "Sri Lanka"}
              </Text>
            </View>

            {/* Budget */}
            {job.budget && (
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Budget</Text>

                <Text style={styles.budget}>Rs. {job.budget}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    overflow: "hidden",
  },

  content: {
    flexDirection: "row",
    padding: 12,
  },

  // IMAGE
  image: {
    width: 95,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },

  // DETAILS
  details: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  // CATEGORY
  categoryChip: {
    alignSelf: "flex-start",
    height: 28,
    backgroundColor: "#FFF5F0",
    borderColor: "#FF6B35",
    marginBottom: 6,
  },

  categoryText: {
    color: "#FF6B35",
    fontSize: 11,
    fontWeight: "600",
    marginVertical: 3,
  },

  // TITLE
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 20,
  },

  description: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
    marginTop: 4,
  },

  // LOCATION
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  location: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 3,
  },

  // BUDGET
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  budgetLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  budget: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B35",
    marginLeft: 5,
  },
});
