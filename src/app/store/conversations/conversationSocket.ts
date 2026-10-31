import { io, Socket } from "socket.io-client";
export interface SocketMessagePayload {
  conversationId: string;
  message: unknown;
}

export interface SocketConversationUpdatedPayload {
  conversationId: string;
  lastMessage: unknown;
}

export interface SocketConversationCreatedPayload {
  conversation: unknown;
}

let socket: Socket | null = null;
let connectedToken: string | null = null;

function getSocketUrl() {
  const url =
    process.env.EXPO_PUBLIC_SOCKET_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    "https://api.yourdomain.com";

  return url.replace(/\/socket\.io\/?$/, "").replace(/\/+$/, "");
}

export function connectConversationSocket(token: string): Socket {
  if (socket && connectedToken === token) {
    return socket;
  }

  socket?.disconnect();
  socket = io(getSocketUrl(), {
    path: "/socket.io",
    auth: { token },
  });
  connectedToken = token;

  return socket;
}
