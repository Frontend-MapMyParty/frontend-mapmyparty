import { apiFetch } from "@/config/api";

export async function fetchOffPlatformTickets(organizerId, eventId) {
  const response = await apiFetch(
    `organizer/${organizerId}/events/${eventId}/off-platform-tickets`
  );
  return response.data;
}

export async function createOffPlatformTicket(organizerId, eventId, data) {
  const response = await apiFetch(
    `organizer/${organizerId}/events/${eventId}/off-platform-tickets`,
    { method: "POST", body: JSON.stringify(data) }
  );
  return response.data;
}

export async function updateOffPlatformTicket(organizerId, eventId, recordId, data) {
  const response = await apiFetch(
    `organizer/${organizerId}/events/${eventId}/off-platform-tickets/${recordId}`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
  return response.data;
}

export async function deleteOffPlatformTicket(organizerId, eventId, recordId) {
  const response = await apiFetch(
    `organizer/${organizerId}/events/${eventId}/off-platform-tickets/${recordId}`,
    { method: "DELETE" }
  );
  return response.data;
}
