// app/(public)/language.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "../../i18n";

const { width } = Dimensions.get("window");
const LANGUAGE_KEY = "appLanguage";

const LanguageScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const setLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      await i18n.changeLanguage(lang);
    } catch (e) {
      // ignore
    }
    router.replace("/(public)/home");
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image
          source={require("../../../assets/images/language.png")}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{t("common.language")}</Text>
        <Text style={styles.description}>
          {t("language.description") ||
            "Select your preferred language to continue using the app in your native language."}
        </Text>
      </View>

      {/* Language Cards */}
      <View style={styles.languageCards}>
        {/* English */}
        <TouchableOpacity
          style={styles.languageCard}
          onPress={() => setLanguage("en")}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/197/197374.png",
                }}
                style={styles.flagImage}
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{t("common.english")}</Text>
              <Text style={styles.cardSubtitle}>
                {t("language.englishSubtitle") || "English (US)"}
              </Text>
            </View>
            <View style={styles.selectBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Sinhala */}
        <TouchableOpacity
          style={styles.languageCard}
          onPress={() => setLanguage("si")}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/197/197571.png",
                }}
                style={styles.flagImage}
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{t("common.sinhala")}</Text>
              <Text style={styles.cardSubtitle}>
                {t("language.sinhalaSubtitle") || "Sinhala"}
              </Text>
            </View>
            <View style={styles.selectBadge}>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t("language.footer") ||
            "You can change the language anytime in the settings menu"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 120 : 40,
    paddingHorizontal: 24,
  },
  headerImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  headerImage: {
    width: width * 0.45,
    height: width * 0.45,
    maxWidth: 200,
    maxHeight: 200,
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  languageCards: {
    gap: 14,
    flex: 1,
  },
  languageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
  },
  flagImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  selectBadge: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: 24,
    marginBottom: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default LanguageScreen;
