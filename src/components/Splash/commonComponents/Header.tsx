import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function Header({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left */}
        <View style={styles.sideContainer}>
          {showBackButton && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBackPress}
              style={styles.backButton}
              hitSlop={8}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.text.inverse}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right */}
        <View style={styles.sideContainer}>{rightComponent}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background.dark,
  },

  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.dark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: 8,
  },

  sideContainer: {
    width: 48,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  titleContainer: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.inverse,
  },
});
