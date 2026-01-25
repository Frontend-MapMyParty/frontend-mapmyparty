import { io } from "socket.io-client";
import { API_BASE_URL } from "@/config/api";

// Get the server URL (without /api suffix)
const getServerUrl = () => {
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return baseUrl;
};

let ticketAnalyticsSocket = null;

/**
 * Connect to the ticket-analytics namespace for real-time ticket updates
 * @param {string} authToken - JWT token for authentication
 * @returns {Socket} - Socket.io socket instance
 */
export const connectTicketAnalytics = (authToken) => {
  if (ticketAnalyticsSocket?.connected) {
    return ticketAnalyticsSocket;
  }

  const serverUrl = getServerUrl();

  ticketAnalyticsSocket = io(`${serverUrl}/ticket-analytics`, {
    auth: { token: authToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  ticketAnalyticsSocket.on("connect", () => {
    console.log("[ticket-analytics] Connected to server");
  });

  ticketAnalyticsSocket.on("connect_error", (err) => {
    console.error("[ticket-analytics] Connection error:", err.message);
  });

  ticketAnalyticsSocket.on("disconnect", (reason) => {
    console.log("[ticket-analytics] Disconnected:", reason);
  });

  return ticketAnalyticsSocket;
};

/**
 * Get the current ticket analytics socket instance
 * @returns {Socket|null}
 */
export const getTicketAnalyticsSocket = () => ticketAnalyticsSocket;

/**
 * Disconnect from ticket analytics
 */
export const disconnectTicketAnalytics = () => {
  if (ticketAnalyticsSocket) {
    ticketAnalyticsSocket.disconnect();
    ticketAnalyticsSocket = null;
  }
};

/**
 * Join an event room to receive real-time ticket updates
 * @param {string} eventId - The event ID to join
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const joinEventRoom = (eventId) => {
  return new Promise((resolve) => {
    if (!ticketAnalyticsSocket?.connected) {
      resolve({ error: "Socket not connected" });
      return;
    }

    ticketAnalyticsSocket.emit("join_event", { eventId }, (response) => {
      resolve(response);
    });
  });
};

/**
 * Leave an event room
 * @param {string} eventId - The event ID to leave
 * @returns {Promise<{success: boolean}>}
 */
export const leaveEventRoom = (eventId) => {
  return new Promise((resolve) => {
    if (!ticketAnalyticsSocket?.connected) {
      resolve({ success: false });
      return;
    }

    ticketAnalyticsSocket.emit("leave_event", { eventId }, (response) => {
      resolve(response);
    });
  });
};
