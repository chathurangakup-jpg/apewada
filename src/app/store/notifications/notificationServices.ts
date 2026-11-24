import * as SecureStore from "expo-secure-store";

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");
const PUSH_TOKEN_KEY = "apeweda-expo-push-token";

export type NotificationPlatform = "IOS" | "ANDROID";

export interface AppNotification {
  id: string;
  title?: string;
  body?: string;
  readAt?: string | null;
  createdAt?: string;
  data?: Record<string, unknown>;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

async function request<T>(
  authToken: string,
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: object,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      `Notification request failed (${response.status}): ${
        result?.message || response.statusText || "Please try again."
      }`,
    );
  }

  return result.data;
}

export async function registerPushToken(
  authToken: string,
  token: string,
  platform: NotificationPlatform,
): Promise<void> {
  await request(authToken, "/api/notifications/push-tokens", "POST", {
    token,
    platform,
  });
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function deactivatePushToken(
  authToken: string,
  token: string,
): Promise<void> {
  await request(authToken, "/api/notifications/push-tokens", "DELETE", {
    token,
  });
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}

export async function deactivateSavedPushToken(
  authToken: string,
): Promise<void> {
  const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (token) {
    await deactivatePushToken(authToken, token);
  }
}

export async function getNotifications(
  authToken: string,
  unreadOnly = true,
  limit = 50,
): Promise<AppNotification[]> {
  const data = await request<{ notifications: AppNotification[] }>(
    authToken,
    `/api/notifications?unreadOnly=${unreadOnly}&limit=${limit}`,
    "GET",
  );
  return data.notifications;
}

export async function markNotificationRead(
  authToken: string,
  notificationId: string,
): Promise<void> {
  await request(
    authToken,
    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    "PATCH",
  );
}

export async function markAllNotificationsRead(
  authToken: string,
): Promise<void> {
  await request(authToken, "/api/notifications/read-all", "PATCH");
}
