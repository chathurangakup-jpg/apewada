import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

import i18n from "../../i18n";
import {
  selectApiAuthError,
  selectApiAuthLoading,
} from "../store/auth/authSelector";
import { AccountRole } from "../store/auth/authServices";
import { clearAuthError } from "../store/auth/authSlice";
import { registerUser } from "../store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const PRIMARY_COLOR = "#F97316";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,18}$/;

type FormField = "name" | "email" | "phone" | "password" | "confirmPassword";

export default function SignupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectApiAuthLoading);
  const authError = useAppSelector(selectApiAuthError);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<AccountRole>("CUSTOMER");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormField, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: FormField, value: string) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "phone") setPhone(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
  };

  const handleSignup = async () => {
    const nextErrors: Partial<Record<FormField, string>> = {};
    const phoneDigits = phone.replace(/\D/g, "").length;
    if (name.trim().length < 2) nextErrors.name = "Enter your full name";
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (
      !PHONE_PATTERN.test(phone.trim()) ||
      phoneDigits < 7 ||
      phoneDigits > 15
    ) {
      nextErrors.phone = "Enter a valid phone number";
    }
    if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters";
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    dispatch(clearAuthError());
    try {
      const preferredLanguage = i18n.resolvedLanguage?.startsWith("si")
        ? "SI"
        : "EN";
      const result = await dispatch(
        registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role,
          preferredLanguage,
        }),
      ).unwrap();

      Alert.alert("Account Created", result.message || "You can now sign in.", [
        { text: "Sign In", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (error: any) {
      Alert.alert("Signup Failed", error || "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.subtitle}>Join our community today</Text>

          {/* Name */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={(value) => updateField("name", value)}
            mode="outlined"
            error={!!fieldErrors.name}
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="account" />}
          />
          <HelperText type="error" visible={!!fieldErrors.name}>
            {fieldErrors.name}
          </HelperText>

          {/* Email */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={(value) => updateField("email", value)}
            mode="outlined"
            error={!!fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="email" />}
          />
          <HelperText type="error" visible={!!fieldErrors.email}>
            {fieldErrors.email}
          </HelperText>

          {/* Phone */}
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={(value) => updateField("phone", value)}
            mode="outlined"
            error={!!fieldErrors.phone}
            keyboardType="phone-pad"
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="phone" />}
          />
          <HelperText type="error" visible={!!fieldErrors.phone}>
            {fieldErrors.phone}
          </HelperText>

          {/* Password */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={(value) => updateField("password", value)}
            mode="outlined"
            error={!!fieldErrors.password}
            secureTextEntry={!showPassword}
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!fieldErrors.password}>
            {fieldErrors.password}
          </HelperText>

          {/* Confirm Password */}
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(value) => updateField("confirmPassword", value)}
            mode="outlined"
            error={!!fieldErrors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!fieldErrors.confirmPassword}>
            {fieldErrors.confirmPassword}
          </HelperText>

          {/* Role */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I want to join as</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isRoleDropdownOpen }}
              style={styles.roleDropdown}
              onPress={() => setIsRoleDropdownOpen((open) => !open)}
            >
              <Text style={styles.roleDropdownText}>
                {role === "CUSTOMER" ? "Customer" : "Worker"}
              </Text>
              <Ionicons
                name={isRoleDropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#777777"
              />
            </Pressable>
            {isRoleDropdownOpen && (
              <View style={styles.roleOptions}>
                {(["CUSTOMER", "WORKER"] as AccountRole[]).map((option) => (
                  <Pressable
                    key={option}
                    style={styles.roleOption}
                    onPress={() => {
                      setRole(option);
                      setIsRoleDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.roleOptionText}>
                      {option === "CUSTOMER" ? "Customer" : "Worker"}
                    </Text>
                    {role === option && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={PRIMARY_COLOR}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {!!authError && <Text style={styles.serverError}>{authError}</Text>}

          {/* Signup */}
          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.signupButton}
            buttonColor={PRIMARY_COLOR}
            textColor="#FFFFFF"
            labelStyle={styles.buttonLabel}
          >
            Create Account
          </Button>

          {/* Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>

            <TouchableOpacity onPress={() => router.back()} disabled={loading}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  form: {
    width: "100%",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    marginBottom: 25,
  },

  input: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  roleContainer: {
    marginTop: 4,
    marginBottom: 24,
  },

  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },

  roleDropdown: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  roleDropdownText: {
    color: "#333333",
    fontSize: 15,
  },

  roleOptions: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  roleOption: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  roleOptionText: {
    color: "#333333",
    fontSize: 15,
  },

  serverError: {
    color: "#B91C1C",
    fontSize: 13,
    marginBottom: 12,
  },

  signupButton: {
    borderRadius: 10,
    paddingVertical: 7,
  },

  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  loginText: {
    color: "#666666",
    fontSize: 14,
  },

  loginLink: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: "700",
  },
});
