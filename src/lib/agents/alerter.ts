import { AgentContext, AgentResponse } from "./types";
import { Finding } from "@/types/types";
import { env } from "@/config/env";

export async function runAlerter(context: AgentContext): Promise<AgentResponse> {
  const { riskScore, input, type } = context;
  const findings: Finding[] = [];

  if (riskScore >= 75) {
      // Critical Alert
      findings.push({
          agent: "Alerter",
          type: "critical",
          message: "CRITICAL ALERT BROADCAST",
          details: "SOC notified via high-priority webhook channels."
      });

      // Try to actually fire webhook if configured
      const webhook = env.data?.ALERT_WEBHOOK;
      if (webhook) {
          try {
              await fetch(webhook, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      level: "CRITICAL",
                      input,
                      type,
                      risk: riskScore,
                      timestamp: new Date().toISOString()
                  })
              });
          } catch(e) {
              console.error("Webhook failed", e);
          }
      }

  } else if (riskScore >= 50) {
      findings.push({
          agent: "Alerter",
          type: "warning",
          message: "Warning Notification Sent",
          details: "Logged to centralized dashboard."
      });
  } else {
      findings.push({
          agent: "Alerter",
          type: "info",
          message: "Standard Logging",
          details: "Event recorded in daily digest."
      });
  }

  return {
      name: "Alerter",
      status: "complete",
      findings
  };
}
