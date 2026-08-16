import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Chip } from "react-native-paper";
import { useAuth } from "../../hooks/useAuth";
import { useJobs } from "../../hooks/useJobs";
import { useWorkers } from "../../hooks/useWorkers";

const { width } = Dimensions.get("window");

export default function PublicHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: workers, isLoading: workersLoading } = useWorkers();
  const { data: jobs, isLoading: jobsLoading } = useJobs();

  const featuredWorkers = workers?.slice(0, 5) || [];
  const recentJobs = jobs?.slice(0, 4) || [];

  const handleGetStarted = () => {
    if (user) {
      router.push("/(customer)/dashboard");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Find Trusted</Text>
          <Text style={styles.heroTitleHighlight}>Service Workers</Text>
          <Text style={styles.heroSubtitle}>
            Connect with verified professionals for your home and business needs
          </Text>
          <View style={styles.heroButtons}>
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.primaryButton}
              labelStyle={styles.buttonLabel}
              icon="arrow-right"
            >
              Get Started
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push("/(public)/workers")}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}
            >
              Browse Workers
            </Button>
          </View>
        </View>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600",
          }}
          style={styles.heroImage}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {[
            "Plumbing",
            "Electrical",
            "Carpentry",
            "Cleaning",
            "Painting",
            "Gardening",
          ].map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.categoryCard}
              onPress={() =>
                router.push(`/(public)/workers?category=${category}`)
              }
            >
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={
                    category === "Plumbing"
                      ? "construct-outline"
                      : category === "Electrical"
                        ? "flash-outline"
                        : category === "Carpentry"
                          ? "hammer-outline"
                          : category === "Cleaning"
                            ? "sparkles-outline"
                            : category === "Painting"
                              ? "color-palette-outline"
                              : "leaf-outline"
                  }
                  size={32}
                  color="#007AFF"
                />
              </View>
              <Text style={styles.categoryName}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Workers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Workers</Text>
          <TouchableOpacity onPress={() => router.push("/(public)/workers")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredWorkers.map((worker) => (
            <TouchableOpacity
              key={worker.id}
              style={styles.workerCard}
              onPress={() => router.push(`/(public)/worker/${worker.id}`)}
            >
              <Image
                source={{
                  uri: worker.user.avatar || "https://i.pravatar.cc/150",
                }}
                style={styles.workerAvatar}
              />
              <Text style={styles.workerName}>{worker.user.name}</Text>
              <Text style={styles.workerProfession}>{worker.profession}</Text>
              <View style={styles.workerRating}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.workerRatingText}>
                  {worker.rating.toFixed(1)}
                </Text>
                <Text style={styles.workerJobs}>({worker.totalJobs} jobs)</Text>
              </View>
              {worker.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <TouchableOpacity onPress={() => router.push("/(public)/jobs")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            onPress={() => router.push(`/(public)/job/${job.id}`)}
          >
            <Card style={styles.jobCard}>
              <Card.Content>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Chip
                    mode="outlined"
                    style={styles.jobChip}
                    textStyle={styles.jobChipText}
                  >
                    {job.category}
                  </Chip>
                </View>
                <Text style={styles.jobDescription} numberOfLines={2}>
                  {job.description}
                </Text>
                <View style={styles.jobFooter}>
                  <View style={styles.jobMeta}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.jobMetaText}>{job.location}</Text>
                  </View>
                  <Text style={styles.jobBudget}>${job.budget}</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
        <Text style={styles.ctaText}>
          Join our community of trusted workers and satisfied customers
        </Text>
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.ctaButton}
          labelStyle={styles.buttonLabel}
        >
          {user ? "Go to Dashboard" : "Sign Up Now"}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  heroSection: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    minHeight: 200,
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 28,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: "#1a1a1a",
  },
  heroTitleHighlight: {
    fontSize: 36,
    fontWeight: "700",
    color: "#007AFF",
    marginTop: -4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  heroButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    flex: 1,
  },
  secondaryButton: {
    borderColor: "#007AFF",
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
    color: "#007AFF",
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
    color: "#1a1a1a",
  },
  seeAll: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesScroll: {
    marginTop: 8,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 12,
    color: "#1a1a1a",
    marginTop: 4,
    textAlign: "center",
  },
  workerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    width: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    color: "#1a1a1a",
    marginTop: 8,
  },
  workerProfession: {
    fontSize: 12,
    color: "#666",
  },
  workerRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  workerRatingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1a1a1a",
    marginLeft: 2,
  },
  workerJobs: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: "#34C759",
    marginLeft: 2,
  },
  jobCard: {
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  jobChip: {
    height: 24,
  },
  jobChipText: {
    fontSize: 10,
  },
  jobDescription: {
    fontSize: 14,
    color: "#666",
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
    color: "#666",
    marginLeft: 4,
  },
  jobBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  ctaSection: {
    backgroundColor: "#007AFF",
    padding: 30,
    margin: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  ctaText: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
});
