export const DEFAULT_NEARBY_RADIUS_KM = 50;

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 120000,
};

export const isGeolocationSupported = () =>
  typeof window !== "undefined" &&
  window.isSecureContext &&
  typeof navigator !== "undefined" &&
  "geolocation" in navigator;

export const getGeolocationErrorMessage = (
  error,
  featureLabel = "Near Me",
) => {
  if (error?.code === 1) {
    return `Location access denied. Please allow location to use ${featureLabel}.`;
  }

  if (error?.code === 3) {
    return "Location request timed out. Please try again.";
  }

  return "Unable to detect your location right now.";
};

export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      const error = new Error("Location is not available in this browser or page context.");
      error.code = 0;
      reject(error);
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS);
  });

export const formatDistanceKm = (distanceKm) => {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance < 0) return null;

  if (distance < 1) {
    const meters = Math.max(1, Math.round(distance * 1000));
    return `${meters} m away`;
  }

  if (distance < 10) {
    return `${distance.toFixed(1)} km away`;
  }

  return `${Math.round(distance)} km away`;
};
