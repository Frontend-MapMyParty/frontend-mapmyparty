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
