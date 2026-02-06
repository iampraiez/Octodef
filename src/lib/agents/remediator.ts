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

  // 2. Dynamic Investigation Actions based on specific findings
  const allMessages = previousFindings.map(f => f.message.toLowerCase()).join(" ");

  if (allMessages.includes("malware") || allMessages.includes("virus")) {
      remediationSteps.push("4. Quarantine endpoint immediately (Malware detection).");
      remediationSteps.push("5. Run full system anti-virus scan.");
  } else if (allMessages.includes("phishing") || allMessages.includes("social engineering")) {
      remediationSteps.push("4. Reset user credentials (potential compromise).");
      remediationSteps.push("5. Review email logs for similar subject lines.");
  } else if (allMessages.includes("botnet") || allMessages.includes("command and control")) {
       remediationSteps.push("4. Block C2 communication at perimeter.");
       remediationSteps.push("5. Capture network traffic for forensic analysis.");
  } else {
      remediationSteps.push("4. Monitor for recurrence over next 24h.");
  }

  // 3. Long term / High Risk
  if (riskScore > 80) {
      const timestamp = new Date().toISOString().split('T')[0];
      remediationSteps.push(`6. Conduct full forensic image of affected systems (Incident #${timestamp}).`);
      remediationSteps.push("7. Submit mandatory breach report to CISO / Compliance team.");
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
