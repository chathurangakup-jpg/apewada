import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ProfileDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const parseDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
};

const formatDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export default function ProfileDatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: ProfileDatePickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(
    parseDate(value) ?? new Date(),
  );
  const selectedDate = parseDate(value);

  const showPicker = () => {
    const draft = selectedDate ?? new Date();
    if (minimumDate && draft < minimumDate) {
      setDraftDate(minimumDate);
    } else if (maximumDate && draft > maximumDate) {
      setDraftDate(maximumDate);
    } else {
      setDraftDate(draft);
    }
    setIsOpen(true);
  };

  const handleNativeChange = (
    event: DateTimePickerEvent,
    date?: Date,
  ) => {
    if (event.type === "set" && date) {
      onChange(formatDate(date));
    }
    setIsOpen(false);
  };

  if (Platform.OS === "android") {
    return (
      <View style={styles.group}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={label}
          style={styles.button}
          onPress={showPicker}
        >
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value || "YYYY-MM-DD"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#FF6B35" />
        </TouchableOpacity>
        {isOpen && (
          <DateTimePicker
            value={draftDate}
            mode="date"
            display="default"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleNativeChange}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.button}
        onPress={showPicker}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || "YYYY-MM-DD"}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#FF6B35" />
      </TouchableOpacity>
      {Platform.OS === "ios" ? (
        <Modal
          visible={isOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.iosPicker}>
              <View style={styles.pickerActions}>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Text style={styles.actionText}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onChange(formatDate(draftDate));
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.actionText}>{t("profile.done")}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(_event, date) => {
                  if (date) setDraftDate(date);
                }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        isOpen && (
          <DateTimePicker
            value={draftDate}
            mode="date"
            display="default"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleNativeChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 16,
  },
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
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  value: {
    color: "#1F2937",
    fontSize: 14,
  },
  placeholder: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  iosPicker: {
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  actionText: {
    color: "#FF6B35",
    fontSize: 16,
    fontWeight: "600",
  },
});
