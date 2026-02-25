const QR_UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const extractValidQrToken = (rawValue) => {
  if (typeof rawValue !== "string") return null;
  const value = rawValue.trim();
  if (!value) return null;

  if (QR_UUID_V4_REGEX.test(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed?.qr === "string" && QR_UUID_V4_REGEX.test(parsed.qr)) {
      return parsed.qr;
    }
    if (typeof parsed?.qrToken === "string" && QR_UUID_V4_REGEX.test(parsed.qrToken)) {
      return parsed.qrToken;
    }
  } catch {
    return null;
  }

  return null;
};

export const buildCanonicalQrPayload = (rawValue) => {
  const qrToken = extractValidQrToken(rawValue);
  if (!qrToken) return null;
  return JSON.stringify({ qr: qrToken });
};
