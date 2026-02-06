import { ThreatType, DefenseResult, AgentStatus } from "@/types/types";
import { AgentContext } from "./types";

// Import Agents
import { runScout } from "./scout";
import { runSentinel } from "./sentinel";
import { runAnalyst } from "./analyst";
import { runIsolator } from "./isolator";
import { runRemediator } from "./remediator";
import { runLearner } from "./learner";
import { runAlerter } from "./alerter";

// Initial Agent Definitions (Metadata)
const AGENT_DEFS = {
  scout: { name: "Scout", desc: "Reconnaissance & Validation" },
  sentinel: { name: "Sentinel", desc: "Blacklist & Threat Intel" },
  analyst: { name: "Analyst", desc: "Deep Behavioral Analysis" },
  isolator: { name: "Isolator", desc: "Containment Strategy" },
  remediator: { name: "Remediator", desc: "Response Playbook" },
  learner: { name: "Learner", desc: "Adaptive ML Training" },
  alerter: { name: "Alerter", desc: "Escalation & Notification" },
  orchestrator: { name: "Orchestrator", desc: "System Coordinator" },
};

export async function analyzeThreat(
  inputRaw: string | Buffer,
  type: ThreatType,
  onProgress?: (result: Omit<DefenseResult, "_id" | "userId" | "timestamp">) => void
): Promise<Omit<DefenseResult, "_id" | "userId" | "timestamp">> {
  
  const start = Date.now();
  const inputStr = typeof inputRaw === 'string' ? inputRaw : "[Buffer Data]";

  // Initialize Result Object
  const result: Omit<DefenseResult, "_id" | "userId" | "timestamp"> = {
    input: { type, data: inputStr.slice(0, 100) + (inputStr.length > 100 ? "..." : "") },
    overallRisk: 0,
    severity: "low",
    agents: Object.keys(AGENT_DEFS).map(key => ({
        id: key,
        name: AGENT_DEFS[key as keyof typeof AGENT_DEFS].name,
        description: AGENT_DEFS[key as keyof typeof AGENT_DEFS].desc,
        status: "idle",
        progress: 0
    })),
    findings: [],
    remediationSteps: [],
    threatMap: [
       { category: "Recon", risk: 0, threats: 0 },
       { category: "Intel", risk: 0, threats: 0 },
       { category: "Anomaly", risk: 0, threats: 0 },
       { category: "Containment", risk: 0, threats: 0 },
    ],
    timeline: [],
    status: "processing"
  };

  // Helper to update state
  const updateState = (
      agentId: string, 
      status: AgentStatus["status"], 
      progress: number, 
      message?: string
  ) => {
      const a = result.agents.find(x => x.id === agentId);
      if (a) {
          a.status = status;
          a.progress = progress;
          if (message) a.result = message; // Using result field for status message
      }
      if (onProgress) onProgress(result);
  };
  
  const addLog = (agent: string, event: string) => {
      result.timeline.push({ time: new Date().toISOString(), agent, event });
  };
  
  // SHARED CONTEXT (The "Brain" state)
  const context: AgentContext = {
      input: inputStr,
      type,
      findings: [],
      riskScore: 0
  };

  try {
      // --- PHASE 1: ORCHESTRATOR START ---
      updateState("orchestrator", "processing", 10, "Initializing agents...");
      addLog("Orchestrator", "Defense cycle initiated");
      
      // --- PHASE 2: SCOUT (Validation) ---
      updateState("scout", "processing", 10);
      const scoutRes = await runScout(context);
      context.findings.push(...scoutRes.findings);
      result.findings.push(...scoutRes.findings);
      updateState("scout", "complete", 100, "Recon complete");
      addLog("Scout", "Input validation finished");

      // --- PHASE 3: PARALLEL INTEL (Sentinel + Analyst) ---
      updateState("sentinel", "processing", 10);
      updateState("analyst", "processing", 10);
      
      // Run them in parallel using Promise.all
      const [sentinelRes, analystRes] = await Promise.all([
          runSentinel(context),
          runAnalyst(context)
      ]);
      
      // Merge results
      context.findings.push(...sentinelRes.findings, ...analystRes.findings);
      result.findings.push(...sentinelRes.findings, ...analystRes.findings);
      
      // Calculate Risk Score
      // Simple additive model for now, capped at 100
      let totalRisk = (sentinelRes.riskScore || 0) + (analystRes.riskScore || 0);
      if (totalRisk > 100) totalRisk = 100;
      context.riskScore = totalRisk;
      result.overallRisk = totalRisk;
      
      // Set Severity
      if (totalRisk >= 80) result.severity = "critical";
      else if (totalRisk >= 60) result.severity = "high";
      else if (totalRisk >= 30) result.severity = "medium";
      else result.severity = "low";

      updateState("sentinel", "complete", 100, `Found ${sentinelRes.findings.length} signals`);
      updateState("analyst", "complete", 100, `Analyzed risk: ${totalRisk}`);
      addLog("Orchestrator", `Risk Assessment: ${result.severity.toUpperCase()} (${totalRisk})`);

      // Update Threat Map visualization data
      result.threatMap[0].risk = Math.random() * 20; // Recon
      result.threatMap[1].risk = (sentinelRes.riskScore || 0); // Intel
      result.threatMap[2].risk = (analystRes.riskScore || 0); // Anomaly
      result.threatMap[3].risk = 0; // Containment (TBD)

      // --- PHASE 4: CONTAINMENT & RESPONSE (Isolator + Remediator) ---
      updateState("isolator", "processing", 10);
      const isolatorRes = await runIsolator(context);
      result.findings.push(...isolatorRes.findings);
      updateState("isolator", "complete", 100, "Policy determined");
      result.threatMap[3].risk = result.overallRisk; // Containment risk reflects overall

      updateState("remediator", "processing", 10);
      const remediatorRes = await runRemediator(context);
      result.findings.push(...remediatorRes.findings);
      result.remediationSteps = (remediatorRes.data as { remediationSteps: string[] })?.remediationSteps || [];
      updateState("remediator", "complete", 100, "Playbook ready");

      // --- PHASE 5: LEARNING & ALERTING (Learner + Alerter) ---
      // These can run in parallel too
      updateState("learner", "processing", 10);
      updateState("alerter", "processing", 10);

      const [learnerRes, alerterRes] = await Promise.all([
          runLearner(context),
          runAlerter(context)
      ]);
      
      result.findings.push(...learnerRes.findings, ...alerterRes.findings);
      updateState("learner", "complete", 100, "Knowledge updated");
      updateState("alerter", "complete", 100, "Notifications sent");

      // --- COMPLETE ---
      result.status = "complete";
      updateState("orchestrator", "complete", 100, "Defense cycle success");
      addLog("Orchestrator", `Cycle finished in ${Date.now() - start}ms`);

  } catch (error) {
      console.error("Orchestrator Error:", error);
      result.status = "failed";
      updateState("orchestrator", "error", 100, "Critical Failure");
      result.findings.push({
          agent: "Orchestrator",
          type: "error",
          message: "System Failure",
          details: error instanceof Error ? error.message : "Unknown error"
      });
  }

  return result;
}
