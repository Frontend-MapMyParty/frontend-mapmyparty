export function normalizeRoleForRouting(role) {
  const normalized = (role || "").toString().trim().toUpperCase();

  if (normalized === "PROMOTER" || normalized === "ADMIN" || normalized === "SUPER_ADMIN") {
    return "PROMOTER";
  }

  if (normalized === "ORGANIZER") {
    return "ORGANIZER";
  }

  return "USER";
}

export function getDashboardPathForRole(role) {
  const normalized = normalizeRoleForRouting(role);

  if (normalized === "PROMOTER") {
    return "/promoter/overview";
  }

  if (normalized === "ORGANIZER") {
    return "/organizer/dashboard";
  }

  return "/dashboard";
}
