import { Ionicons } from "@expo/vector-icons";
import {
  Redirect,
  router,
  Tabs,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useTranslation } from "react-i18next";
import {
  selectApiAuthToken,
  selectApiAuthUser,
} from "../../store/auth/authSelector";
import {
  normalizeConversation,
  normalizeConversationMessage,
} from "../../store/conversations/conversationServices";
import {
  addSocketConversation,
  receiveSocketMessage,
  setConversationSocketError,
  updateSocketConversation,
} from "../../store/conversations/conversationSlice";
import {
  connectConversationSocket,
  disconnectConversationSocket,
  type SocketConversationCreatedPayload,
  type SocketConversationUpdatedPayload,
  type SocketMessagePayload,
} from "../../store/conversations/conversationSocket";
import {
  selectConversations,
  selectCurrentConversation,
  selectUnreadConversationCount,
} from "../../store/conversations/conversationSelector";
import {
  fetchConversations,
  markMessagesRead,
} from "../../store/conversations/conversationThunk";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectCurrentUser } from "../../store/profile/profileSelector";
import { getSavedSessionToken } from "../../store/profile/profileServices";

export default function TabsLayout() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { conversationId, participantId } = useGlobalSearchParams<{
    conversationId?: string | string[];
    participantId?: string | string[];
  }>();
  const dispatch = useAppDispatch();
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const apiAuthToken = useAppSelector(selectApiAuthToken);
  const profileUser = useAppSelector(selectCurrentUser);
  const currentConversation = useAppSelector(selectCurrentConversation);
  const conversations = useAppSelector(selectConversations);
  const unreadConversationCount = useAppSelector(
    selectUnreadConversationCount,
  );
  const isAuthenticated = Boolean(apiAuthUser || profileUser);
  const currentUserId = (profileUser ?? apiAuthUser)?.id;
  const pathnameRef = useRef(pathname);
  const conversationIdRef = useRef(conversationId);
  const participantIdRef = useRef(participantId);
  const currentConversationIdRef = useRef(currentConversation?.id);
  const currentUserIdRef = useRef(currentUserId);
  const conversationIdsRef = useRef(new Set<string>());
  const joinedConversationIdsRef = useRef(new Set<string>());
  const activeSocketRef =
    useRef<ReturnType<typeof connectConversationSocket> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  pathnameRef.current = pathname;
  conversationIdRef.current = conversationId;
  participantIdRef.current = participantId;
  currentConversationIdRef.current = currentConversation?.id;
  currentUserIdRef.current = currentUserId;
  conversationIdsRef.current = new Set(
    conversations.map((conversation) => conversation.id),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      appStateRef.current = state;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void dispatch(fetchConversations());
  }, [currentUserId, dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let activeSocket: ReturnType<typeof connectConversationSocket> | null =
      null;
    let isMounted = true;

    const joinConversation = (conversationId: string) => {
      if (
        !activeSocket?.connected ||
        joinedConversationIdsRef.current.has(conversationId)
      ) {
        return;
      }

      activeSocket.emit("conversation:join", { conversationId });
      joinedConversationIdsRef.current.add(conversationId);
    };

    const joinKnownConversations = () => {
      joinedConversationIdsRef.current.clear();
      conversationIdsRef.current.forEach(joinConversation);
      const currentConversationId = currentConversationIdRef.current;
      if (currentConversationId) {
        joinConversation(currentConversationId);
      }
    };

    const handleNewMessage = (payload: SocketMessagePayload) => {
      try {
        const message = normalizeConversationMessage(payload.message);
        const currentId = currentUserIdRef.current;
        const isIncoming = Boolean(
          currentId && message.senderId !== currentId,
        );
        const focusedConversationId = Array.isArray(
          conversationIdRef.current,
        )
          ? conversationIdRef.current[0]
          : conversationIdRef.current;
        const focusedParticipantId = Array.isArray(
          participantIdRef.current,
        )
          ? participantIdRef.current[0]
          : participantIdRef.current;
        const isChatRouteFocused =
          pathnameRef.current.endsWith("/chat") &&
          (focusedConversationId === payload.conversationId ||
            (!focusedConversationId && Boolean(focusedParticipantId)));
        const isConversationActive =
          isIncoming &&
          appStateRef.current === "active" &&
          isChatRouteFocused &&
          currentConversationIdRef.current === payload.conversationId;

        dispatch(
          receiveSocketMessage({
            conversationId: payload.conversationId,
            message,
            isIncoming,
            isConversationActive,
          }),
        );

        if (!conversationIdsRef.current.has(payload.conversationId)) {
          void dispatch(fetchConversations());
        }

        if (isConversationActive) {
          void dispatch(markMessagesRead(payload.conversationId));
        }
      } catch (error) {
        dispatch(
          setConversationSocketError(
            error instanceof Error
              ? error.message
              : "Unable to process the incoming message.",
          ),
        );
      }
    };

    const handleConversationUpdated = (
      payload: SocketConversationUpdatedPayload,
    ) => {
      try {
        dispatch(
          updateSocketConversation({
            conversationId: payload.conversationId,
            lastMessage:
              payload.lastMessage === null
                ? null
                : typeof payload.lastMessage === "string"
                  ? payload.lastMessage
                  : normalizeConversationMessage(payload.lastMessage).content,
          }),
        );
      } catch (error) {
        dispatch(
          setConversationSocketError(
            error instanceof Error
              ? error.message
              : "Unable to update the conversation.",
          ),
        );
      }
    };

    const handleConversationCreated = (
      payload: SocketConversationCreatedPayload,
    ) => {
      try {
        const newConversation = normalizeConversation(
          payload.conversation,
          currentUserIdRef.current,
        );
        dispatch(addSocketConversation(newConversation));
        joinConversation(newConversation.id);
      } catch (error) {
        dispatch(
          setConversationSocketError(
            error instanceof Error
              ? error.message
              : "Unable to process the new conversation.",
          ),
        );
      }
    };

    const handleConnectError = (connectionError: Error) => {
      dispatch(
        setConversationSocketError(
          connectionError.message || t("chat.realtimeFailed"),
        ),
      );
    };

    const connect = async () => {
      try {
        const token = apiAuthToken ?? (await getSavedSessionToken());
        if (!token || !isMounted) {
          return;
        }

        activeSocket = connectConversationSocket(token);
        activeSocketRef.current = activeSocket;
        activeSocket.on("connect", joinKnownConversations);
        activeSocket.on("message:new", handleNewMessage);
        activeSocket.on("conversation:updated", handleConversationUpdated);
        activeSocket.on("conversation:created", handleConversationCreated);
        activeSocket.on("connect_error", handleConnectError);
        if (activeSocket.connected) {
          joinKnownConversations();
        }
      } catch (error) {
        dispatch(
          setConversationSocketError(
            error instanceof Error
              ? error.message
              : "Unable to connect to chat.",
          ),
        );
      }
    };

    void connect();

    return () => {
      isMounted = false;
      if (activeSocketRef.current === activeSocket) {
        activeSocketRef.current = null;
      }
      joinedConversationIdsRef.current.clear();
      activeSocket?.off("message:new", handleNewMessage);
      activeSocket?.off("conversation:updated", handleConversationUpdated);
      activeSocket?.off("conversation:created", handleConversationCreated);
      activeSocket?.off("connect_error", handleConnectError);
      activeSocket?.off("connect", joinKnownConversations);
      disconnectConversationSocket(activeSocket ?? undefined);
    };
  }, [apiAuthToken, dispatch, isAuthenticated, t]);

  useEffect(() => {
    const activeSocket = activeSocketRef.current;
    if (!activeSocket?.connected) {
      return;
    }

    conversations.forEach(({ id }) => {
      if (!joinedConversationIdsRef.current.has(id)) {
        activeSocket.emit("conversation:join", { conversationId: id });
        joinedConversationIdsRef.current.add(id);
      }
    });

    const currentConversationId = currentConversation?.id;
    if (
      currentConversationId &&
      !joinedConversationIdsRef.current.has(currentConversationId)
    ) {
      activeSocket.emit("conversation:join", {
        conversationId: currentConversationId,
      });
      joinedConversationIdsRef.current.add(currentConversationId);
    }
  }, [conversations, currentConversation?.id]);

  const [tabName, homeSection, homeItem] = pathname
    .split("/")
    .filter(Boolean);
  const requiresAuth =
    ["bookings", "chat", "profile"].includes(tabName) ||
    (tabName === "home" &&
      ([
        "create-job",
        "my-jobs",
        "booking-request",
        "worker-job-requests",
        "worker-requests",
      ].includes(homeSection) ||
        (homeSection === "workers" &&
          homeItem !== undefined &&
          !["workers", "allWorkers"].includes(homeItem)) ||
        (homeSection === "jobs" &&
          homeItem !== undefined &&
          !["jobs", "allJobs"].includes(homeItem))));

  if (!isAuthenticated && requiresAuth) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenListeners={({ route }) => ({
        tabPress: (event) => {
          if (!isAuthenticated && route.name !== "home") {
            event.preventDefault();
            router.push("/(auth)/login");
          }
        },
      })}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#FF6B35",
        },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabs.chat"),
          tabBarBadge:
            unreadConversationCount > 0
              ? unreadConversationCount
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#EF4444",
            color: "#FFFFFF",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubbles-outline"
              size={size}
              color={unreadConversationCount > 0 ? "#EF4444" : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
