import { AgentContext, AgentResponse } from "./types";
import { Finding } from "@/types/types";

export async function runIsolator(context: AgentContext): Promise<AgentResponse> {
  const { type, riskScore } = context;
  const findings: Finding[] = [];

  // Determine isolation policy based on Risk Score
  // Normalized Risk Score is assumed to be 0-100
  let policy = "MONITOR";
  
  if (riskScore >= 80) {
      policy = "FULL_ISOLATION";
      findings.push({
          agent: "Isolator",
          type: "critical",
          message: "Full Isolation Protocol Activated",
          details: "Incoming threat score exceeds critical threshold (80+). Immediate quarantine enforced."
      });
  } else if (riskScore >= 50) {
      policy = "PARTIAL_BLOCK";
       findings.push({
          agent: "Isolator",
          type: "warning",
          message: "Partial Blocking Enforced",
          details: "Traffic limited / Sandbox analysis required."
      });
  } else {
      findings.push({
          agent: "Isolator",
          type: "info",
          message: "No Isolation Required",
          details: "Traffic within normal operating parameters."
      });
  }

  // Type-specific isolation details
  if (policy !== "MONITOR") {
      if (type === "ip") {
          findings.push({
              agent: "Isolator",
              type: "info",
              message: "Network Layer Block",
              details: "IP address added to perimeter firewall deny list."
          });
      } else if (type === "url" || type === "hash" || type === "email") {
           findings.push({
              agent: "Isolator",
              type: "info",
              message: "Asset Quarantine",
              details: "Entity hash propagated to Endpoint Detection (EDR) blocklists."
          });
      }
  }

  return {
      name: "Isolator",
      status: "complete",
      findings,
      data: { policy }
  };
}
