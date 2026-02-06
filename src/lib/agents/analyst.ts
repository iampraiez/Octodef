import { AgentContext, AgentResponse } from "./types";
import { Finding } from "@/types/types";
import { env } from "@/config/env";

export async function runAnalyst(context: AgentContext): Promise<AgentResponse> {
  const { input, type } = context;
  const findings: Finding[] = [];
  let riskContribution = 0;

  // VirusTotal V3 Analysis (Deeper generic analysis)
  // This works best for Hashes, URLs, IPs, domains
  try {
      const key = env.data?.VIRUSTOTAL_API_KEY;
      if (key) {
        let endpoint = "";
        let id_for_api = input;

        if (type === "ip") endpoint = `ip_addresses/${input}`;
        else if (type === "hash") endpoint = `files/${input}`;
        else if (type === "url") {
            // VT requires base64 URL without padding
            id_for_api = Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
            endpoint = `urls/${id_for_api}`;
        }

        if (endpoint) {
            const res = await fetch(`https://www.virustotal.com/api/v3/${endpoint}`, {
                headers: { 'x-apikey': key }
            });
            
            if (res.ok) {
                const json = await res.json();
                const stats = json.data?.attributes?.last_analysis_stats;
                if (stats) {
                    const malicious = stats.malicious || 0;
                    const suspicious = stats.suspicious || 0;
                    
                    if (malicious > 0 || suspicious > 0) {
                        const score = Math.min((malicious * 10) + (suspicious * 5), 100);
                        riskContribution += score;
                        findings.push({
                            agent: "Analyst",
                            type: score > 20 ? "critical" : "warning",
                            message: "VirusTotal Analysis Malicious",
                            details: `${malicious} engines detected malware, ${suspicious} suspicious.`
                        });
                    } else {
                         findings.push({
                            agent: "Analyst",
                            type: "info",
                            message: "VirusTotal Analysis Clean",
                            details: "No engines detected malicious activity"
                        });
                    }
                }
            }
        }
      }
  } catch (e) {
      // VT might fail or be rate limited (429), just log it
      console.log("Analyst VT check skipped/failed", e);
  }

  // Heuristics / Pattern Analysis (for Logs/Email)
  if (type === "email" || type === "log") {
      const suspiciousPatterns = [
          /password/i, /admin/i, /SELECT.*FROM/i, /<script>/i, 
          /base64/i, /eval\(/i, /union select/i
      ];
      
      let heuristicScore = 0;
      suspiciousPatterns.forEach(p => {
          if (p.test(input)) heuristicScore += 10;
      });
      
      if (heuristicScore > 0) {
          riskContribution += heuristicScore;
          findings.push({
              agent: "Analyst",
              type: "warning",
              message: "Heuristic Anomalies Detected",
              details: "Input contains patterns commonly associated with attacks"
          });
      }
  }

  return {
      name: "Analyst",
      status: "complete",
      riskScore: riskContribution,
      findings
  };
}
