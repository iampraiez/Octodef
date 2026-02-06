import { useState, useEffect } from "react";
import { ThreatInput, AgentStatus, DefenseResult } from "@/types/types";
import { AGENTS } from "@/lib/mockData";
import { useDefendMutation, useSimulateAttackMutation } from "./defenseQueries";
import { toast } from "sonner";

/**
 * Custom hook to manage Dashboard state and mutations
 */
export function useDashboardState() {
  const [agents, setAgents] = useState<AgentStatus[]>(
    AGENTS.map((agent) => ({ ...agent, status: "idle" as const, progress: 0 }))
  );
  const [result, setResult] = useState<DefenseResult | null>(null);

  const defendMutation = useDefendMutation();
  const simulateMutation = useSimulateAttackMutation();

  const isProcessing = defendMutation.isPending || simulateMutation.isPending;

  // Handle successful defend mutation
  useEffect(() => {
    if (defendMutation.isSuccess && defendMutation.data) {
      setResult(defendMutation.data);
      toast.success("Threat analysis complete!");
    }
  }, [defendMutation.isSuccess, defendMutation.data]);

  // Handle successful simulate mutation
  useEffect(() => {
    if (simulateMutation.isSuccess && simulateMutation.data) {
      setResult(simulateMutation.data);
      toast.success("Simulated attack analyzed!");
    }
  }, [simulateMutation.isSuccess, simulateMutation.data]);

  // Handle mutations errors
  useEffect(() => {
    if (defendMutation.isError) {
      toast.error("Failed to analyze threat. Please try again.");
      setAgents(
        AGENTS.map((agent) => ({ ...agent, status: "idle" as const, progress: 0 }))
      );
    }
  }, [defendMutation.isError]);

  useEffect(() => {
    if (simulateMutation.isError) {
      toast.error("Failed to simulate attack. Please try again.");
      setAgents(
        AGENTS.map((agent) => ({ ...agent, status: "idle" as const, progress: 0 }))
      );
    }
  }, [simulateMutation.isError]);

  const handleDefend = (input: ThreatInput) => {
    setResult(null);
    setAgents(
      AGENTS.map((agent) => ({ ...agent, status: "processing", progress: 0 }))
    );

    defendMutation.mutate({
      input,
      onProgress: (partialResult) => {
        // Update agents state with progress
        if (partialResult.agents) {
          setAgents((prev) => {
            const newAgents = [...prev];
            partialResult.agents.forEach((updatedAgent) => {
              const idx = newAgents.findIndex((a) => a.id === updatedAgent.id);
              if (idx !== -1) {
                newAgents[idx] = { ...newAgents[idx], ...updatedAgent };
              }
            });
            return newAgents;
          });
        }
        
        // Update result with partial data
        if (partialResult.findings || partialResult.overallRisk !== undefined) {
          setResult((prev) => {
            if (!prev) {
              return {
                ...partialResult,
                threatMap: partialResult.threatMap || [],
                timeline: partialResult.timeline || [],
                agents: partialResult.agents || [],
                findings: partialResult.findings || [],
                input: {
                  type: input.type,
                  data: typeof input.data === "string" ? input.data : "",
                },
                overallRisk: partialResult.overallRisk || 0,
                severity: partialResult.severity || "low",
                remediationSteps: partialResult.remediationSteps || [],
                status: partialResult.status || "processing",
              } as DefenseResult;
            }
            return { ...prev, ...partialResult } as DefenseResult;
          });
        }
      },
    });
  };

  const handleSimulate = () => {
    simulateMutation.mutate();
  };

  return {
    agents,
    result,
    isProcessing,
    handleDefend,
    handleSimulate,
  };
}
