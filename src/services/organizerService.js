import { apiFetch } from "@/config/api";

export async function fetchAllOrganizers() {
  const response = await apiFetch("organizer");
  return response.data;
}

export async function fetchOrganizerById(id) {
  const response = await apiFetch(`organizer/${id}`);
  return response.data;
}

export async function fetchOrganizerStats(id) {
  const response = await apiFetch(`organizer/${id}/stats`);
  return response.data;
}

export async function fetchOrganizerEvents(id, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  const response = await apiFetch(`event/organizer/${id}${qs ? `?${qs}` : ""}`);
  return response.data;
}

export async function fetchOrganizerEventsAdmin(id, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  const response = await apiFetch(`admin/organizers/${id}/events${qs ? `?${qs}` : ""}`);
  return response.data;
}

export async function fetchOrganizerReviews(id, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  const response = await apiFetch(`organizer/${id}/reviews${qs ? `?${qs}` : ""}`);
  return response.data;
}
