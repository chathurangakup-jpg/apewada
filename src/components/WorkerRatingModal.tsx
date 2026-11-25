import type { WorkerReview } from "@/app/store/workers/workerReview.types";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WorkerRatingModalProps {
  visible: boolean;
  rating: number;
  reviewCount: number;
  reviews: WorkerReview[];
  onClose: () => void;
}

export default function WorkerRatingModal({
  visible,
  rating,
  reviewCount,
  reviews,
  onClose,
}: WorkerRatingModalProps) {
  const safeRating = Number.isFinite(rating)
    ? Math.min(5, Math.max(0, rating))
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close ratings"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Worker ratings</Text>
          <Text style={styles.rating}>{safeRating.toFixed(1)}</Text>
          <View
            accessibilityLabel={`${safeRating.toFixed(1)} out of 5 stars`}
            style={styles.stars}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(safeRating) ? "star" : "star-outline"}
                size={28}
                color="#F59E0B"
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>
            {reviewCount || reviews.length}{" "}
            {(reviewCount || reviews.length) === 1 ? "review" : "reviews"}
          </Text>
          {reviews.length > 0 ? (
            <ScrollView
              style={styles.reviewList}
              contentContainerStyle={styles.reviewListContent}
              showsVerticalScrollIndicator
            >
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.customerName}>
                      {review.customerName}
                    </Text>
                    <Text style={styles.createdAt}>
                      {formatReviewDate(review.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.jobTitle}>{review.jobTitle}</Text>
                  <View
                    accessibilityLabel={`${review.rating} out of 5 stars`}
                    style={styles.reviewStars}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={16}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  {!!review.comment && (
                    <Text style={styles.comment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.empty}>
              {reviewCount > 0
                ? "Written reviews are not available."
                : "No customer ratings yet."}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
  },
  modal: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    maxHeight: "85%",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  title: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  rating: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1F2937",
  },
  stars: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  reviewCount: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  reviewList: {
    width: "100%",
    marginTop: 16,
    flexGrow: 0,
  },
  reviewListContent: {
    gap: 10,
    paddingBottom: 4,
  },
  reviewCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 5,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  customerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  createdAt: {
    fontSize: 11,
    color: "#6B7280",
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  comment: {
    fontSize: 13,
    color: "#374151",
  },
  empty: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
  },
});

function formatReviewDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
