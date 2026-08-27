import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
// import { useAuth } from "../../hooks/useAuth";

export default function CustomerLayout() {
  const { t } = useTranslation();
  // const { user, isAuthenticated, isLoading } = useAuth();

  // if (isLoading) return null;

  // // Customer routes are protected - must be logged in as customer
  // if (!isAuthenticated) {
  //   return <Redirect href="/(auth)/login" />;
  // }

  // if (user?.role !== "customer") {
  //   return <Redirect href="/(public)" />;
  // }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tabs.dashboard"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t("tabs.myJobs"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: t("tabs.reviews"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="job/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="quotation/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
