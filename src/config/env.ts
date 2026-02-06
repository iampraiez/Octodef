import * as z from "zod";

/**
 * Environment variable validation
 * Only keeping essential variables after auth removal
 */
const envValidator = z.object({
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  
  VIRUSTOTAL_API_KEY: z.string().min(1, "VirusTotal API key is required"),
  HYBRID_ANALYSIS_API_KEY: z.string().min(1, "Hybrid Analysis API key is required"),
  MALSHARE_API_KEY: z.string().min(1, "MalShare API key is required"),
  ABUSEIPDB_API_KEY: z.string().min(1, "AbuseIPDB API key is required"),
  GOOGLE_SAFE_BROWSING_API_KEY: z.string().min(1, "Google Safe Browsing API key is required"),
  
  // Optional
  ALERT_WEBHOOK: z.string().optional(),
});

export const env = envValidator.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}
