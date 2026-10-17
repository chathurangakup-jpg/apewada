import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { HomeWorker } from "../app/store/home/homeServices";

interface HomeWorkerTileProps {
  worker: HomeWorker;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function HomeWorkerTile({
  worker,
  onPress,
  style,
}: HomeWorkerTileProps) {
  return (
    <TouchableOpacity
      style={[styles.workerCard, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: worker.avatarPath || "https://i.pravatar.cc/150",
        }}
        style={styles.workerAvatar}
      />
      <Text style={styles.workerName}>{worker.name}</Text>
      <Text style={styles.workerProfession} numberOfLines={1}>
        {worker.categories.map((category) => category.nameEn).join(", ") ||
          "General Worker"}
      </Text>
      <View style={styles.workerRating}>
        <Ionicons name="star" size={14} color="#FFB800" />
        <Text style={styles.workerRatingText}>
          {Number(worker.averageRating || 0).toFixed(1)}
        </Text>
        <Text style={styles.workerJobs}>
          ({worker.reviewCount || 0} reviews)
        </Text>
      </View>
      <View style={styles.workerLocation}>
        <Ionicons name="location" size={12} color="#6B7280" />
        <Text style={styles.workerLocationText} numberOfLines={1}>
          {[worker.city, worker.district].filter(Boolean).join(", ")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
