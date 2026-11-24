import {
  selectApiAuthToken,
  selectApiAuthUser,
} from "@/app/store/auth/authSelector";
import { fetchConversations } from "@/app/store/conversations/conversationThunk";
import {
  markNotificationRead,
  registerPushToken,
  type NotificationPlatform,
} from "@/app/store/notifications/notificationServices";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectCurrentUser } from "@/app/store/profile/profileSelector";
import { getSavedSessionToken } from "@/app/store/profile/profileServices";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getNotificationPlatform(): NotificationPlatform {
  if (Platform.OS === "ios") {
    return "IOS";
  }
  if (Platform.OS === "android") {
    return "ANDROID";
  }
  throw new Error(`Push notifications are not supported on ${Platform.OS}.`);
}

function getNotificationData(
  notification: Notifications.Notification,
): Record<string, unknown> {
  return notification.request.content.data as Record<string, unknown>;
}

export default function PushNotificationManager() {
  const dispatch = useAppDispatch();
  const apiAuthToken = useAppSelector(selectApiAuthToken);
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const profileUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = Boolean(apiAuthUser || profileUser);
  const currentUserId = (profileUser ?? apiAuthUser)?.id;
  const registeredUserId = useRef<string | undefined>(undefined);
  const processedResponseId = useRef<string | null>(null);

  const handleNotificationResponse = useCallback(
    async (response: Notifications.NotificationResponse) => {
      const notification = response.notification;
      if (processedResponseId.current === notification.request.identifier) {
        return;
      }
      processedResponseId.current = notification.request.identifier;

      const data = getNotificationData(notification);
      const conversationId =
        typeof data.conversationId === "string"
          ? data.conversationId
          : typeof data.conversation_id === "string"
            ? data.conversation_id
            : undefined;
      const notificationId =
        typeof data.notificationId === "string"
          ? data.notificationId
          : typeof data.notification_id === "string"
            ? data.notification_id
            : undefined;

      try {
        const token = apiAuthToken ?? (await getSavedSessionToken());
        if (token && notificationId) {
          await markNotificationRead(token, notificationId);
        }
      } catch (error) {
        console.error("Unable to mark the opened notification as read:", error);
      }

      if (conversationId) {
        router.push({
          pathname: "/(public)/(tabs)/chat",
          params: { conversationId },
        });
      }
    },
    [apiAuthToken],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      registeredUserId.current = undefined;
      return;
    }

    if (!currentUserId || Platform.OS === "web") {
      return;
    }

    let isMounted = true;

    const registerDevice = async () => {
      const authToken = apiAuthToken ?? (await getSavedSessionToken());
      if (
        !authToken ||
        !isMounted ||
        registeredUserId.current === currentUserId
      ) {
        return;
      }

      if (Platform.OS === "android" && Constants.expoVersion) {
        console.warn(
          "Remote push notifications require an Android development or production build; they are not available in Expo Go.",
        );
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error(
          "Expo EAS project ID is missing. Initialize the app with EAS and configure extra.eas.projectId before registering push notifications.",
        );
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("messages", {
          name: "Messages",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B35",
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      const { status } =
        existingStatus === "granted"
          ? { status: existingStatus }
          : await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Push notification permission was not granted.");
        return;
      }

      const expoPushToken = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      if (!isMounted) {
        return;
      }

      await registerPushToken(
        authToken,
        expoPushToken,
        getNotificationPlatform(),
      );
      registeredUserId.current = currentUserId;
    };

    void registerDevice().catch((error: unknown) => {
      console.error(
        "Unable to register this device for push notifications:",
        error,
      );
    });

    return () => {
      isMounted = false;
    };
  }, [apiAuthToken, currentUserId, isAuthenticated]);

  useEffect(() => {
    const receivedSubscription =
      Notifications.addNotificationReceivedListener(() => {
        if (isAuthenticated) {
          void dispatch(fetchConversations());
        }
      });
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        void handleNotificationResponse(response);
      });

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      void handleNotificationResponse(lastResponse);
    }

    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active" && isAuthenticated) {
          void dispatch(fetchConversations());
        }
      },
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, [dispatch, handleNotificationResponse, isAuthenticated]);

  return null;
}
