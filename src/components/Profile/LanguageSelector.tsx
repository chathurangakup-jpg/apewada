import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LanguageSelectorProps {
  visible: boolean;
  currentLanguage: string;
  onClose: () => void;
  onChangeLanguage: (language: string) => void;
}

export default function LanguageSelector({
  visible,
  currentLanguage,
  onClose,
  onChangeLanguage,
}: LanguageSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Language</Text>
              <Text style={styles.subtitle}>
                Choose your preferred language
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* English */}
          <TouchableOpacity
            style={[
              styles.languageOption,
              currentLanguage === "en" && styles.selectedOption,
            ]}
            onPress={() => onChangeLanguage("en")}
          >
            <View style={styles.languageInfo}>
              <View style={styles.iconContainer}>
                <Text style={styles.flag}>🇬🇧</Text>
              </View>

              <View>
                <Text style={styles.languageName}>English</Text>
                <Text style={styles.languageSubName}>English</Text>
              </View>
            </View>

            {currentLanguage === "en" && (
              <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
            )}
          </TouchableOpacity>

          {/* Sinhala */}
          <TouchableOpacity
            style={[
              styles.languageOption,
              currentLanguage === "si" && styles.selectedOption,
            ]}
            onPress={() => onChangeLanguage("si")}
          >
            <View style={styles.languageInfo}>
              <View style={styles.iconContainer}>
                <Text style={styles.flag}>🇱🇰</Text>
              </View>

              <View>
                <Text style={styles.languageName}>සිංහල</Text>
                <Text style={styles.languageSubName}>Sinhala</Text>
              </View>
            </View>

            {currentLanguage === "si" && (
              <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  languageOption: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedOption: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF7F3",
  },

  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  flag: {
    fontSize: 25,
  },

  languageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },

  languageSubName: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  cancelButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
});
