import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type AccountRole = "CUSTOMER" | "WORKER";
export type PreferredLanguage = "EN" | "SI";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  preferredLanguage: PreferredLanguage;
  avatarPath: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: AccountRole;
  preferredLanguage: PreferredLanguage;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LoginData {
  token: string;
  user: AuthUser;
}

interface RegisterData {
  user?: AuthUser;
}

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/$/, "");
const AUTH_TOKEN_KEY = "apeweda-auth-token";

async function post<T>(path: string, body: object): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !result.success) {
    throw new Error(result.message || "The request could not be completed");
  }

  return result;
}

export async function registerAccount(
  request: RegisterRequest,
): Promise<{ message: string; user?: AuthUser }> {
  const result = await post<RegisterData>("/api/auth/register", request);
  return { message: result.message, user: result.data?.user };
}

export async function loginAccount(request: LoginRequest): Promise<LoginData> {
  const result = await post<LoginData>("/api/auth/login", request);
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, result.data.token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
  return result.data;
}

export async function getStoredAuthToken(): Promise<string | null> {
  return Platform.OS === "web"
    ? null
    : SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function removeStoredAuthToken(): Promise<void> {
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  }
}
