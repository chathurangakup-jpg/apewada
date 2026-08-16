import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Authenticated users go to their role-specific dashboard
        if (user.role === "customer") {
          router.replace("/(customer)/dashboard");
        } else if (user.role === "worker") {
          router.replace("/(worker)/home");
        } else if (user.role === "admin") {
          router.replace("/(public)/dashboard");
        }
      } else {
        // Not logged in - go to public home
        router.replace("/(public)");
      }
    }
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
