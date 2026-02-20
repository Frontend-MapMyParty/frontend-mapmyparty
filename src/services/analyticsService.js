import { apiFetch } from "@/config/api";

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, value);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
}

export async function fetchDashboardSummary(params = {}) {
  const response = await apiFetch(`analytics/dashboard-summary${buildQuery(params)}`);
  return response.data;
}

export async function fetchRevenueOverTime(params = {}) {
  const response = await apiFetch(`analytics/revenue-over-time${buildQuery(params)}`);
  return response.data;
}

export async function fetchEventsByCategory(params = {}) {
  const response = await apiFetch(`analytics/events-by-category${buildQuery(params)}`);
  return response.data;
}

export async function fetchRevenueByOrganizer(params = {}) {
  const response = await apiFetch(`analytics/revenue-by-organizer${buildQuery(params)}`);
  return response.data;
}

export async function fetchTicketDistribution(params = {}) {
  const response = await apiFetch(`analytics/ticket-distribution${buildQuery(params)}`);
  return response.data;
}

export async function fetchEventAnalytics(organizerId, eventId) {
  const response = await apiFetch(`organizer/${organizerId}/events/${eventId}/analytics`);
  return response.data;
}

// ─── Split Event Analytics Endpoints ─────────────────────────────────────────

export async function fetchEventSummary(organizerId, eventId) {
  const response = await apiFetch(`organizer/${organizerId}/events/${eventId}/analytics/summary`);
  return response.data;
}

export async function fetchEventTicketBreakdown(organizerId, eventId) {
  const response = await apiFetch(`organizer/${organizerId}/events/${eventId}/analytics/ticket-breakdown`);
  return response.data;
}

export async function fetchEventSalesTimeline(organizerId, eventId, groupBy = 'day') {
  const response = await apiFetch(`organizer/${organizerId}/events/${eventId}/analytics/sales-timeline?groupBy=${groupBy}`);
  return response.data;
}

export async function fetchEventRevenueBreakdown(organizerId, eventId) {
  const response = await apiFetch(`organizer/${organizerId}/events/${eventId}/analytics/revenue-breakdown`);
  return response.data;
}

export async function fetchEventBookingStats(organizerId, eventId) {
  const response = await apiFetch(`organizer/${organizerId}/events/${eventId}/analytics/booking-stats`);
  return response.data;
}

export async function fetchEventCheckinStats(organizerId, eventId) {
  const response = await apiFetch(`organizer/${organizerId}/events/${eventId}/analytics/checkin-stats`);
  return response.data;
}
