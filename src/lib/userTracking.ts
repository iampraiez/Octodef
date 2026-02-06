import { createHash } from "crypto";

/**
 * Generate a unique fingerprint for a user based on IP and User-Agent
 */
export function generateUserFingerprint(ip: string, userAgent: string): string {
  const combined = `${ip}:${userAgent}`;
  return createHash("sha256").update(combined).digest("hex");
}

/**
 * Extract IP from request headers
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Extract User-Agent from request headers
 */
export function getUserAgent(headers: Headers): string {
  return headers.get("user-agent") || "unknown";
}

/**
 * Get user tracking data from request
 */
export function getUserTrackingData(headers: Headers) {
  const ip = getClientIp(headers);
  const userAgent = getUserAgent(headers);
  const fingerprint = generateUserFingerprint(ip, userAgent);

  return {
    ip,
    userAgent,
    fingerprint,
  };
}
