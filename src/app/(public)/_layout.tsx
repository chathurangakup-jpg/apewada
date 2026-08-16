import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
        }}
      />
      <Stack.Screen
        name="workers"
        options={{
          title: "Find Workers",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="worker/[id]"
        options={{
          title: "Worker Profile",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="jobs"
        options={{
          title: "Browse Jobs",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="job/[id]"
        options={{
          title: "Job Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: "Dashboard",
        }}
      />
    </Stack>
  );
}
