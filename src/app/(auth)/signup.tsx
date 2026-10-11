import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, RadioButton, TextInput } from "react-native-paper";

import { supabase } from "../../supabase";
import { UserRole } from "../../types";

const PRIMARY_COLOR = "#F97316";

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim(),
            role,
          },
        },
      });

      if (error) {
        Alert.alert("Signup Failed", error.message);
        return;
      }

      // If email confirmation is enabled in Supabase
      if (data.user && !data.session) {
        Alert.alert(
          "Account Created",
          "Your account has been created. Please check your email and verify your account before signing in.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login"),
            },
          ],
        );

        return;
      }

      // If email confirmation is disabled
      if (data.session) {
        Alert.alert("Success", "Your account has been created successfully.");

        router.replace("/(public)/home");
      }
    } catch (error: any) {
      Alert.alert("Signup Failed", error?.message || "Something went wrong");
    } finally {
      setLoading(false);
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
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="account" />}
          />

          {/* Email */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="email" />}
          />

          {/* Phone */}
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            activeOutlineColor={PRIMARY_COLOR}
            outlineColor="#D6D6D6"
            left={<TextInput.Icon icon="phone" />}
          />

          {/* Password */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
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

          {/* Confirm Password */}
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
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

          {/* Role */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I want to join as:</Text>

            <RadioButton.Group
              onValueChange={(value) => setRole(value as UserRole)}
              value={role}
            >
              <View style={styles.radioOption}>
                <RadioButton value={UserRole.CUSTOMER} color={PRIMARY_COLOR} />
                <Text style={styles.radioLabel}>Customer</Text>
              </View>

              <View style={styles.radioOption}>
                <RadioButton value={UserRole.WORKER} color={PRIMARY_COLOR} />
                <Text style={styles.radioLabel}>Worker</Text>
              </View>
            </RadioButton.Group>
          </View>

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

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },

  radioLabel: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 4,
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
