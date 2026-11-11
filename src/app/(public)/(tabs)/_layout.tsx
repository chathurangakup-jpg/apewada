import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, Tabs, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { selectApiAuthUser } from "../../store/auth/authSelector";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentUser } from "../../store/profile/profileSelector";

export default function TabsLayout() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const profileUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = Boolean(apiAuthUser || profileUser);
  const [tabName, homeSection, homeItem] = pathname
    .split("/")
    .filter(Boolean);
  const requiresAuth =
    ["bookings", "chat", "profile", "wallet", "history"].includes(tabName) ||
    (tabName === "home" &&
      (["create-job", "my-jobs"].includes(homeSection) ||
        (homeSection === "workers" &&
          homeItem !== undefined &&
          !["workers", "allWorkers"].includes(homeItem)) ||
        (homeSection === "jobs" &&
          homeItem !== undefined &&
          !["jobs", "allJobs"].includes(homeItem))));

  if (!isAuthenticated && requiresAuth) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenListeners={({ route }) => ({
        tabPress: (event) => {
          if (!isAuthenticated && route.name !== "home") {
            event.preventDefault();
            router.push("/(auth)/login");
          }
        },
      })}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#FF6B35",
        },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          headerShown: false,
          title: t("tabs.wallet"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("tabs.history"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabs.chat"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
