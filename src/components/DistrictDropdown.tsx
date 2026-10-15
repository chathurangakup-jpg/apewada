import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SRI_LANKA_DISTRICTS } from "../constants/districts";

interface DistrictDropdownProps {
  value: string;
  onChange: (district: string) => void;
  label?: string;
  placeholder?: string;
  includeAllDistricts?: boolean;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  buttonStyle?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

export default function DistrictDropdown({
  value,
  onChange,
  label,
  placeholder,
  includeAllDistricts = false,
  leadingIcon,
  buttonStyle,
  valueStyle,
}: DistrictDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const districts = includeAllDistricts
    ? ["All Districts", ...SRI_LANKA_DISTRICTS]
    : SRI_LANKA_DISTRICTS;

  const selectDistrict = (district: string) => {
    onChange(district);
    setIsOpen(false);
  };

  return (
    <View>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label ?? t("jobs.selectDistrict")}
        style={[styles.button, buttonStyle]}
        onPress={() => setIsOpen(true)}
      >
        {leadingIcon && (
          <Ionicons name={leadingIcon} size={18} color="#FF6B35" />
        )}
        <Text style={[styles.value, valueStyle]} numberOfLines={1}>
          {value || placeholder || t("jobs.selectDistrict")}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable
            style={styles.dropdown}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{t("jobs.selectDistrict")}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setIsOpen(false)}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={districts}
              keyExtractor={(district) => district}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    value === item && styles.selectedItem,
                  ]}
                  onPress={() => selectDistrict(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      value === item && styles.selectedItemText,
                    ]}
                  >
                    {item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark" size={20} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 6,
  },
  button: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdown: {
    maxHeight: "70%",
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedItem: {
    backgroundColor: "#FFF5F0",
  },
  itemText: {
    fontSize: 15,
    color: "#1F2937",
  },
  selectedItemText: {
    color: "#FF6B35",
    fontWeight: "600",
  },
});
