import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  selectApiAuthError,
  selectApiAuthLoading,
} from "../store/auth/authSelector";
import { clearAuthError } from "../store/auth/authSlice";
import { loginUser } from "../store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectApiAuthLoading);
  const authError = useAppSelector(selectApiAuthError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    const nextEmailError = EMAIL_PATTERN.test(email.trim())
      ? ""
      : "Enter a valid email address";
    const nextPasswordError = password ? "" : "Enter your password";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    dispatch(clearAuthError());
    try {
      await dispatch(
        loginUser({
          email: email.trim().toLowerCase(),
          password,
        }),
      ).unwrap();
      router.replace("/(public)/(tabs)/home/home");
    } catch (error) {
      Alert.alert(
        "Login failed",
        typeof error === "string" ? error : "Something went wrong",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="hammer" size={32} color="#fff" />
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#777" />

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <Text style={styles.label}>Password</Text>

          <View
            style={[
              styles.inputContainer,
              passwordError && styles.inputContainerError,
            ]}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#777" />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError("");
              }}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#777"
              />
            </TouchableOpacity>
          </View>
          {!!passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          {!!authError && <Text style={styles.errorText}>{authError}</Text>}

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>

            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#777",
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  inputContainerError: {
    borderColor: "#DC2626",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#222",
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    marginTop: 5,
  },

  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  signupText: {
    color: "#777",
    fontSize: 14,
  },

  signupLink: {
    color: "#F97316",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
  },
});
