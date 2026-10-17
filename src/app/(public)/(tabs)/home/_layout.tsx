import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="workers" />
      <Stack.Screen name="workers/all" />
      <Stack.Screen name="jobs/all" />
      {/* <Stack.Screen name="quiz/[quizId]/questions" /> */}
    </Stack>
  );
}
