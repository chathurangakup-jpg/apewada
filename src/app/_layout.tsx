import { Ionicons } from "@expo/vector-icons";
import { QueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentProps } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../i18n";

import { StoreProvider } from "./store/providers";

const queryClient = new QueryClient();
const paperIconNames: Record<string, ComponentProps<typeof Ionicons>["name"]> =
  {
    account: "person-outline",
    email: "mail-outline",
    phone: "call-outline",
    lock: "lock-closed-outline",
    "eye-off": "eye-off-outline",
    eye: "eye-outline",
    "lock-check": "checkmark-circle-outline",
    "arrow-right": "arrow-forward",
  };

export default function RootLayout() {
  return (
    <StoreProvider>
      {/* <PushNotificationManager /> */}
      <SafeAreaProvider>
        <PaperProvider
          settings={{
            icon: ({ name, color, size }) => (
              <Ionicons
                name={paperIconNames[name] ?? "help-circle-outline"}
                color={color}
                size={size}
              />
            ),
          }}
        >
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(public)" options={{ headerShown: false }} />
            <Stack.Screen name="(customer)" options={{ headerShown: false }} />
            <Stack.Screen name="(worker)" options={{ headerShown: false }} />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </StoreProvider>
  );
}
