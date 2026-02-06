import { AgentContext, AgentResponse } from "./types";
import { env } from "@/config/env";
import { Finding } from "@/types/types";

// This agent checks external blacklists
export async function runSentinel(context: AgentContext): Promise<AgentResponse> {
  const { input, type } = context;
  const findings: Finding[] = [];
  let riskContribution = 0;

  // 1. Google Safe Browsing (for URLs)
  if (type === "url") {
     try {
         const key = env.data?.GOOGLE_SAFE_BROWSING_API_KEY;
         if (key) {
             const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     client: { clientId: "octodef", clientVersion: "1.0.0" },
                     threatInfo: {
                         threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                         platformTypes: ["ANY_PLATFORM"],
                         threatEntryTypes: ["URL"],
                         threatEntries: [{ url: input }]
                     }
                 })
             });
             const data = await res.json();
             if (data.matches && data.matches.length > 0) {
                 riskContribution += 50;
                 findings.push({
                     agent: "Sentinel",
                     type: "critical",
                     message: "Detected by Google Safe Browsing",
                     details: `Threat: ${data.matches[0].threatType}`
                 });
             }
         }
     } catch (e) {
         console.error("GSB failed", e);
     }
  }

  // 2. AbuseIPDB (for IPs)
  if (type === "ip") {
      try {
          const key = env.data?.ABUSEIPDB_API_KEY;
          if (key) {
               const res = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${input}`, {
                   headers: { 'Key': key, 'Accept': 'application/json' }
               });
               const data = await res.json();
               if (data.data && data.data.abuseConfidenceScore > 0) {
                   const score = data.data.abuseConfidenceScore;
                   riskContribution += score; // Direct mapping
                   findings.push({
                       agent: "Sentinel",
                       type: score > 50 ? "critical" : "warning",
                       message: `AbuseIPDB Confidence: ${score}%`,
                       details: `Usage: ${data.data.usageType || 'Unknown'}, Country: ${data.data.countryCode}`
                   });
               }
          }
      } catch (e) {
          console.error("AbuseIPDB failed", e);
      }
  }
  
  // If no threats found in ANY blacklist
  if (riskContribution === 0) {
      findings.push({
          agent: "Sentinel",
          type: "info",
          message: "Perimeter Clear",
          details: "Not found in active blacklists"
      });
  }

  return {
      name: "Sentinel",
      status: "complete",
      riskScore: riskContribution,
      findings
  };
}
