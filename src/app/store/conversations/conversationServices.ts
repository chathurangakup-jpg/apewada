const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com"
).replace(/\/+$/, "");

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Conversation {
  id: string;
  participantId?: string;
  jobId?: string | null;
  jobTitle?: string | null;
  customerId?: string;
  workerId?: string;
  participantName?: string;
  participantRole?: string;
  participantAvatarPath?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
}

export interface ConversationMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface CreateConversationData {
  conversation: unknown;
}

interface MessagesData {
  messages: unknown[];
}

interface ConversationsData {
  conversations: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getMessageContent(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value) && typeof value.content === "string") {
    return value.content;
  }

  return null;
}

export function normalizeConversationMessage(
  value: unknown,
): ConversationMessage {
  if (!isRecord(value)) {
    throw new Error("The server returned an invalid conversation message.");
  }

  const id = getOptionalString(value.id);
  const content = getOptionalString(value.content);
  const senderId = getOptionalString(value.senderId);
  const createdAt = getOptionalString(value.createdAt ?? value.sentAt);

  if (!id || !content || !senderId || !createdAt) {
    throw new Error("The server returned an incomplete conversation message.");
  }

  return { id, content, senderId, createdAt };
}

interface ConversationParticipant {
  id?: string;
  name?: string;
  avatarPath?: string;
}

function getConversationParticipant(value: unknown): ConversationParticipant {
  if (!isRecord(value)) {
    return {};
  }

  const user = isRecord(value.user) ? value.user : undefined;

  return {
    id:
      getOptionalString(user?.id) ??
      getOptionalString(value.userId) ??
      getOptionalString(value.id),
    name: getOptionalString(value.name) ?? getOptionalString(user?.name),
    avatarPath:
      getOptionalString(value.avatarPath) ??
      getOptionalString(value.avatar) ??
      getOptionalString(user?.avatarPath) ??
      getOptionalString(user?.avatar),
  };
}

function getCounterpart(
  value: Record<string, unknown>,
  currentUserId?: string,
): ConversationParticipant {
  const participant = getConversationParticipant(
    value.participant ?? value.participantUser,
  );
  if (participant.name) {
    return participant;
  }

  const people = [
    getConversationParticipant(value.customer),
    getConversationParticipant(value.worker),
  ].filter((person) => person.name);

  return (
    (currentUserId
      ? people.find((person) => person.id !== currentUserId)
      : undefined) ??
    people[0] ??
    participant
  );
}

export function normalizeConversation(
  value: unknown,
  currentUserId?: string,
): Conversation {
  if (!isRecord(value)) {
    throw new Error("The server returned an invalid conversation.");
  }

  const id = getOptionalString(value.id);
  if (!id) {
    throw new Error("The server returned a conversation without an ID.");
  }

  const unreadCount =
    typeof value.unreadCount === "number" && Number.isFinite(value.unreadCount)
      ? value.unreadCount
      : undefined;
  const counterpart = getCounterpart(value, currentUserId);

  return {
    id,
    participantId: getOptionalString(value.participantId) ?? counterpart.id,
    jobId: getOptionalString(value.jobId) ?? null,
    jobTitle: getOptionalString(value.jobTitle) ?? null,
    customerId: getOptionalString(value.customerId),
    workerId: getOptionalString(value.workerId),
    participantName:
      getOptionalString(value.participantName) ?? counterpart.name,
    participantRole: getOptionalString(value.participantRole),
    participantAvatarPath:
      getOptionalString(value.participantAvatarPath) ??
      counterpart.avatarPath ??
      null,
    createdAt: getOptionalString(value.createdAt),
    updatedAt: getOptionalString(value.updatedAt),
    lastMessage: getMessageContent(value.lastMessage),
    lastMessageAt: getOptionalString(value.lastMessageAt),
    unreadCount,
  };
}

async function request<T>(
  token: string,
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: object,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "The request could not be completed");
  }

  return result.data;
}

export async function createConversation(
  token: string,
  participantId: string,
  jobId?: string,
  currentUserId?: string,
): Promise<Conversation> {
  const data = await request<CreateConversationData>(
    token,
    "/api/conversations",
    "POST",
    {
      participantId,
      ...(jobId ? { jobId } : {}),
    },
  );

  return normalizeConversation(data.conversation, currentUserId);
}

export async function getConversations(
  token: string,
  currentUserId?: string,
): Promise<Conversation[]> {
  const data = await request<ConversationsData>(
    token,
    "/api/conversations",
    "GET",
  );

  return data.conversations.map((conversation) =>
    normalizeConversation(conversation, currentUserId),
  );
}

export async function getConversationMessages(
  token: string,
  conversationId: string,
): Promise<ConversationMessage[]> {
  const data = await request<MessagesData>(
    token,
    `/api/conversations/${conversationId}/messages?limit=50`,
    "GET",
  );

  return data.messages.map(normalizeConversationMessage);
}

export async function sendConversationMessage(
  token: string,
  conversationId: string,
  content: string,
): Promise<void> {
  await request(
    token,
    `/api/conversations/${conversationId}/messages`,
    "POST",
    {
      content,
    },
  );
}

export async function markConversationRead(
  token: string,
  conversationId: string,
): Promise<void> {
  await request(token, `/api/conversations/${conversationId}/read`, "PATCH");
}
