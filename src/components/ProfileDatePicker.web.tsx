import { createElement, type ChangeEvent } from "react";
import { Text, View } from "react-native";
import type { ProfileDatePickerProps } from "./ProfileDatePicker";

const formatDate = (date?: Date) =>
  date
    ? [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-")
    : undefined;

export default function ProfileDatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: ProfileDatePickerProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          marginBottom: 6,
          color: "#1F2937",
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
      {createElement("input", {
        type: "date",
        value,
        min: formatDate(minimumDate),
        max: formatDate(maximumDate),
        "aria-label": label,
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.currentTarget.value),
        style: {
          boxSizing: "border-box",
          width: "100%",
          minHeight: 44,
          padding: "10px 12px",
          border: "none",
          borderRadius: 8,
          backgroundColor: "#F3F4F6",
          color: "#1F2937",
          fontSize: 14,
        },
      })}
    </View>
  );
}
