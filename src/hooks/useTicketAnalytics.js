import { useState, useEffect, useCallback, useRef } from "react";
import {
  connectTicketAnalytics,
  getTicketAnalyticsSocket,
  disconnectTicketAnalytics,
  joinEventRoom,
  leaveEventRoom,
} from "@/services/socketService";

/**
 * Hook for real-time ticket analytics updates
 * @param {string} eventId - The event ID to subscribe to
 * @param {string} authToken - JWT token for authentication (optional, will try to get from sessionStorage)
 * @returns {{ tickets: Array, connected: boolean, error: string|null, refetch: Function }}
 */
export const useTicketAnalytics = (eventId, authToken = null) => {
  const [tickets, setTickets] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const eventIdRef = useRef(eventId);

  // Get auth token from sessionStorage if not provided
  const getAuthToken = useCallback(() => {
    if (authToken) return authToken;
    return sessionStorage.getItem("authToken") || sessionStorage.getItem("accessToken");
  }, [authToken]);

  // Manual refetch by re-joining the event room
  const refetch = useCallback(async () => {
    const socket = getTicketAnalyticsSocket();
    if (socket?.connected && eventIdRef.current) {
      const response = await joinEventRoom(eventIdRef.current);
      if (response.error) {
        setError(response.error);
      }
    }
  }, []);

  useEffect(() => {
    eventIdRef.current = eventId;

    if (!eventId) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    // Connect to socket
    const socket = connectTicketAnalytics(token);
    socketRef.current = socket;

    const handleConnect = async () => {
      setConnected(true);
      setError(null);

      // Join the event room
      const response = await joinEventRoom(eventId);
      if (response.error) {
        setError(response.error);
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectError = (err) => {
      setError(err.message);
      setConnected(false);
    };

    // Handle initial ticket stats
    const handleTicketStats = (data) => {
      if (data.eventId === eventId) {
        setTickets(data.tickets || []);
        setError(null);
      }
    };

    // Handle real-time ticket updates
    const handleTicketUpdate = (data) => {
      if (data.eventId === eventId) {
        setTickets(data.tickets || []);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("ticket_stats", handleTicketStats);
    socket.on("ticket_update", handleTicketUpdate);

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("ticket_stats", handleTicketStats);
      socket.off("ticket_update", handleTicketUpdate);

      if (eventId) {
        leaveEventRoom(eventId);
      }
    };
  }, [eventId, getAuthToken]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      disconnectTicketAnalytics();
    };
  }, []);

  return { tickets, connected, error, refetch };
};

export default useTicketAnalytics;
