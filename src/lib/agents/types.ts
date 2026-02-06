import { Finding, ThreatType } from "@/types/types";

export interface AgentContext {
  input: string;
  type: ThreatType;
  findings: Finding[];
  riskScore: number;
}

export interface AgentResponse {
  name: string;
  status: "complete" | "failed" | "processing";
  riskScore?: number; // Contribution to risk
  findings: Finding[];
  data?: unknown; // Agent-specific data to pass to others
}

export type ProgressCallback = (
  agentName: string,
  status: "processing" | "complete" | "error",
  progress: number,
  message?: string
) => void;
