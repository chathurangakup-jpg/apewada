import {
  selectApiAuthToken,
  selectApiAuthUser,
} from "@/app/store/auth/authSelector";
import {
  selectConversationError,
  selectConversationMessages,
  selectConversationMessagesLoading,
  selectConversations,
  selectConversationSending,
  selectConversationsLoading,
  selectConversationStarting,
  selectCurrentConversation,
} from "@/app/store/conversations/conversationSelector";
import type { ConversationMessage } from "@/app/store/conversations/conversationServices";
import {
  normalizeConversation,
  normalizeConversationMessage,
} from "@/app/store/conversations/conversationServices";
import {
  addSocketConversation,
  openConversation,
  receiveSocketMessage,
  setConversationSocketError,
  updateSocketConversation,
} from "@/app/store/conversations/conversationSlice";
import {
  connectConversationSocket,
  SocketConversationCreatedPayload,
  SocketConversationUpdatedPayload,
  SocketMessagePayload,
} from "@/app/store/conversations/conversationSocket";
import {
  fetchConversationMessages,
  fetchConversations,
  markMessagesRead,
  sendMessage,
  startConversation,
} from "@/app/store/conversations/conversationThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { selectCurrentUser } from "@/app/store/profile/profileSelector";
import { getSavedSessionToken } from "@/app/store/profile/profileServices";
import Header from "@/components/Splash/commonComponents/Header";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function getSingleParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function ChatScreen() {
  const { t } = useTranslation();
  const {
    participantId: participantParam,
    participantName: participantNameParam,
    jobId: jobParam,
    conversationId: conversationIdParam,
  } = useLocalSearchParams<{
    participantId?: string | string[];
    participantName?: string | string[];
    jobId?: string | string[];
    conversationId?: string | string[];
  }>();
  const participantId = getSingleParam(participantParam);
  const participantName = getSingleParam(participantNameParam);
  const jobId = getSingleParam(jobParam);
  const conversationId = getSingleParam(conversationIdParam);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const apiAuthToken = useAppSelector(selectApiAuthToken);
  const apiAuthUser = useAppSelector(selectApiAuthUser);
  const profileUser = useAppSelector(selectCurrentUser);
  const currentUserId = (profileUser ?? apiAuthUser)?.id;
  const conversation = useAppSelector(selectCurrentConversation);
  const conversations = useAppSelector(selectConversations);
  const messages = useAppSelector(selectConversationMessages);
  const isStarting = useAppSelector(selectConversationStarting);
  const isLoadingConversations = useAppSelector(selectConversationsLoading);
  const isLoadingMessages = useAppSelector(selectConversationMessagesLoading);
  const isSending = useAppSelector(selectConversationSending);
  const error = useAppSelector(selectConversationError);
  const [content, setContent] = useState("");
  const messageListRef = useRef<FlatList<ConversationMessage>>(null);
  const scrolledConversationId = useRef<string | null>(null);
  const isConversationList = !participantId && !conversationId;

  const refreshMessages = useCallback(
    async (conversationId: string) => {
      const fetchAction = await dispatch(
        fetchConversationMessages(conversationId),
      );

      if (fetchConversationMessages.fulfilled.match(fetchAction)) {
        await dispatch(markMessagesRead(conversationId));
      }
    },
    [dispatch],
  );

  const initializeConversation = useCallback(async () => {
    if (conversationId) {
      dispatch(
        openConversation({
          id: conversationId,
          participantName,
        }),
      );
      await refreshMessages(conversationId);
      return;
    }

    if (!participantId) {
      await dispatch(fetchConversations());
      return;
    }

    const startAction = await dispatch(
      startConversation({ participantId, jobId }),
    );

    if (startConversation.fulfilled.match(startAction)) {
      await refreshMessages(startAction.payload.id);
    }
  }, [
    conversationId,
    dispatch,
    jobId,
    participantId,
    participantName,
    refreshMessages,
  ]);

  useFocusEffect(
    useCallback(() => {
      void initializeConversation();
    }, [initializeConversation]),
  );

  useEffect(() => {
    let activeSocket: ReturnType<typeof connectConversationSocket> | null =
      null;
    let isMounted = true;
    const activeConversationId = conversation?.id;
    const handleConnect = () => {
      if (activeConversationId) {
        activeSocket?.emit("conversation:join", {
          conversationId: activeConversationId,
        });
      }
    };
    const handleNewMessage = (payload: SocketMessagePayload) => {
      const message = normalizeConversationMessage(payload.message);
      const isIncoming = message.senderId !== currentUserId;
      dispatch(
        receiveSocketMessage({
          conversationId: payload.conversationId,
          message,
          isIncoming,
        }),
      );

      if (payload.conversationId === activeConversationId && isIncoming) {
        void dispatch(markMessagesRead(activeConversationId));
      }
    };
    const handleConversationUpdated = (
      payload: SocketConversationUpdatedPayload,
    ) => {
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
    };
    const handleConversationCreated = (
      payload: SocketConversationCreatedPayload,
    ) => {
      const newConversation = normalizeConversation(
        payload.conversation,
        currentUserId,
      );
      dispatch(
        addSocketConversation(newConversation),
      );

      if (!newConversation.participantName) {
        void dispatch(fetchConversations());
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
      const token = apiAuthToken ?? (await getSavedSessionToken());
      if (!token || !isMounted) {
        return;
      }

      activeSocket = connectConversationSocket(token);
      activeSocket.on("connect", handleConnect);
      activeSocket.on("connect_error", handleConnectError);
      activeSocket.on("message:new", handleNewMessage);
      activeSocket.on("conversation:updated", handleConversationUpdated);
      activeSocket.on("conversation:created", handleConversationCreated);

      if (activeSocket.connected) {
        handleConnect();
      }
    };

    void connect();

    return () => {
      isMounted = false;
      if (activeConversationId) {
        activeSocket?.emit("conversation:leave", {
          conversationId: activeConversationId,
        });
      }
      activeSocket?.off("connect", handleConnect);
      activeSocket?.off("connect_error", handleConnectError);
      activeSocket?.off("message:new", handleNewMessage);
      activeSocket?.off("conversation:updated", handleConversationUpdated);
      activeSocket?.off("conversation:created", handleConversationCreated);
    };
  }, [apiAuthToken, conversation?.id, currentUserId, dispatch, t]);

  useEffect(() => {
    if (!conversation || messages.length === 0) {
      scrolledConversationId.current = null;
      return;
    }

    if (scrolledConversationId.current === conversation.id) {
      return;
    }

    scrolledConversationId.current = conversation.id;
    requestAnimationFrame(() => {
      messageListRef.current?.scrollToEnd({ animated: true });
    });
  }, [conversation?.id, messages.length]);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!conversation || !trimmedContent) {
      return;
    }

    const sendAction = await dispatch(
      sendMessage({ conversationId: conversation.id, content: trimmedContent }),
    );

    if (sendMessage.fulfilled.match(sendAction)) {
      setContent("");
      await refreshMessages(conversation.id);
    }
  };

  const formatMessageTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        });
  };

  const formatConversationTime = (value?: string | null) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
  };

  const handleOpenConversation = (nextConversation: {
    id: string;
    participantName?: string;
  }) => {
    router.push({
      pathname: "/(public)/(tabs)/chat",
      params: {
        conversationId: nextConversation.id,
        participantName: nextConversation.participantName,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Header
        title={
          isConversationList
            ? t("chat.conversations")
            : participantName ||
              conversation?.participantName ||
              t("chat.title")
        }
        showBackButton={!isConversationList}
        onBackPress={() => router.replace("/(public)/(tabs)/chat")}
      />

      {isConversationList ? (
        isLoadingConversations && !conversations.length ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.emptyText}>{t("chat.loading")}</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void dispatch(fetchConversations())}
            >
              <Text style={styles.retryButtonText}>{t("chat.retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              conversations.length
                ? styles.conversationListContent
                : styles.emptyMessagesContent
            }
            refreshControl={
              <RefreshControl
                refreshing={isLoadingConversations}
                onRefresh={() => void dispatch(fetchConversations())}
                tintColor="#FF6B35"
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.conversationRow}
                onPress={() => handleOpenConversation(item)}
              >
                <View style={styles.avatar}>
                  <Ionicons name="person" size={23} color="#FF6B35" />
                </View>
                <View style={styles.conversationDetails}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.participantName} numberOfLines={1}>
                      {item.participantName || t("chat.unknownParticipant")}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {formatConversationTime(
                        item.lastMessageAt || item.updatedAt,
                      )}
                    </Text>
                  </View>
                  <View style={styles.conversationPreview}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage || t("chat.noMessages")}
                    </Text>
                    {!!item.unreadCount && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>
                          {item.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  {!!item.jobTitle && (
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {item.jobTitle}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.listDivider} />}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={56}
                  color="#9CA3AF"
                />
                <Text style={styles.emptyTitle}>
                  {t("chat.noConversations")}
                </Text>
                <Text style={styles.emptyText}>
                  {t("chat.noConversationText")}
                </Text>
              </View>
            }
          />
        )
      ) : isStarting && !conversation ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.emptyText}>{t("chat.loading")}</Text>
        </View>
      ) : error && !conversation ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void initializeConversation()}
          >
            <Text style={styles.retryButtonText}>{t("chat.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {error && <Text style={styles.inlineError}>{error}</Text>}
          <FlatList
            ref={messageListRef}
            data={messages}
            keyExtractor={(message) => message.id}
            contentContainerStyle={
              messages.length
                ? styles.messagesContent
                : styles.emptyMessagesContent
            }
            refreshControl={
              <RefreshControl
                onRefresh={() => {
                  if (conversation) {
                    void refreshMessages(conversation.id);
                  }
                }}
                refreshing={isLoadingMessages && Boolean(conversation)}
                tintColor="#FF6B35"
              />
            }
            renderItem={({ item }) => {
              const isOwnMessage = item.senderId === currentUserId;
              return (
                <View
                  style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownMessage : styles.receivedMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isOwnMessage && styles.ownMessageText,
                    ]}
                  >
                    {item.content}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      isOwnMessage && styles.ownMessageTime,
                    ]}
                  >
                    {formatMessageTime(item.createdAt)}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Text style={styles.emptyText}>{t("chat.noMessages")}</Text>
              </View>
            }
          />

          <View style={styles.composer}>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder={t("chat.placeholder")}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              multiline
              maxLength={2000}
              editable={!isSending}
            />
            <TouchableOpacity
              accessibilityLabel={t("chat.send")}
              disabled={!content.trim() || isSending}
              onPress={() => void handleSend()}
              style={[
                styles.sendButton,
                (!content.trim() || isSending) && styles.sendButtonDisabled,
              ]}
            >
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  errorText: {
    marginTop: 12,
    color: "#B91C1C",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  inlineError: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#B91C1C",
    backgroundColor: "#FEF2F2",
    fontSize: 13,
  },
  conversationListContent: {
    backgroundColor: "#FFFFFF",
  },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5F0",
  },
  conversationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantName: {
    flex: 1,
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "700",
  },
  conversationTime: {
    marginLeft: 8,
    color: "#9CA3AF",
    fontSize: 12,
  },
  conversationPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  lastMessage: {
    flex: 1,
    color: "#6B7280",
    fontSize: 14,
  },
  unreadBadge: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
    height: 20,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  jobTitle: {
    marginTop: 3,
    color: "#9CA3AF",
    fontSize: 12,
  },
  listDivider: {
    height: 1,
    marginLeft: 76,
    backgroundColor: "#F3F4F6",
  },
  messagesContent: {
    gap: 8,
    padding: 16,
  },
  emptyMessagesContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  emptyMessages: {
    alignItems: "center",
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 6,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FF6B35",
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#1F2937",
    fontSize: 15,
    lineHeight: 21,
  },
  ownMessageText: {
    color: "#FFFFFF",
  },
  messageTime: {
    alignSelf: "flex-end",
    marginTop: 3,
    color: "#6B7280",
    fontSize: 11,
  },
  ownMessageTime: {
    color: "#FFE2D6",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    maxHeight: 120,
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    color: "#1F2937",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  sendButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FF6B35",
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
});
