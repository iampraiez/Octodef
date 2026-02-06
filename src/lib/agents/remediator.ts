import { AgentContext, AgentResponse } from "./types";
import { Finding } from "@/types/types";

export async function runRemediator(context: AgentContext): Promise<AgentResponse> {
  const { type, riskScore, findings: previousFindings } = context;
  const findings: Finding[] = [];
  const remediationSteps: string[] = [];

  // 1. Immediate Actions
  remediationSteps.push("1. Log incident in SIEM for correlation.");
  
  if (riskScore > 50) {
      if (type === "ip") {
          remediationSteps.push("2. Block Source IP at Firewall/Edge Router.");
          remediationSteps.push("3. Terminate active sessions from this IP.");
      } else if (type === "url") {
          remediationSteps.push("2. block domain in DNS resolver / Proxy.");
          remediationSteps.push("3. Clear browser cache for affected users.");
      } else if (type === "email") {
          remediationSteps.push("2. Purge email from all user inboxes.");
          remediationSteps.push("3. Reset credentials for recipient account.");
      } else if (type === "hash") {
          remediationSteps.push("2. Kill process matching file hash.");
          remediationSteps.push("3. Delete file and isolate host.");
      }
  }

  // 2. Investigation Actions
  const criticalFindings = previousFindings.filter(f => f.type === "critical");
  if (criticalFindings.length > 0) {
      remediationSteps.push(`4. Investigate specific critical alert: "${criticalFindings[0].message}"`);
  } else {
      remediationSteps.push("4. Monitor for recurrence over next 24h.");
  }

  // 3. Long term
  if (riskScore > 80) {
      remediationSteps.push("5. Conduct full forensic image of affected systems.");
      remediationSteps.push("6. Submit report to CISO / Compliance team.");
  }

  findings.push({
      agent: "Remediator",
      type: "info",
      message: "Playbook Generated",
      details: `${remediationSteps.length} steps generated based on risk profile.`
  });

  return {
      name: "Remediator",
      status: "complete",
      findings,
      data: { remediationSteps }
  };
}
