import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="workers" />
      {/* <Stack.Screen name="quiz/[quizId]/questions" /> */}
    </Stack>
  );
}
