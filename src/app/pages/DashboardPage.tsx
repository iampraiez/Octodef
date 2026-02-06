"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { ThreatInputForm } from "@/components/ThreatInputForm";
import { AgentProgressBar } from "@/components/AgentProgressBar";
import { ThreatGraph } from "@/components/ThreatGraph";
import { ResultsCard } from "@/components/ResultsCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AttackSimulation3D } from "@/components/AttackSimulation3D";
import {
  useDefendMutation,
  useSimulateAttackMutation,
} from "@/hooks/defenseQueries";
import { ThreatInput, AgentStatus, DefenseResult } from "@/types/types";
import { AGENTS } from "@/lib/mockData";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentStatus[]>(
    AGENTS.map((agent) => ({ ...agent, status: "idle" as const, progress: 0 }))
  );
  const [result, setResult] = useState<DefenseResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    async function fetchSession() {
      const session = await getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }
      setLoading(false);
    }
    fetchSession();
  }, [router]);

  const defendMutation = useDefendMutation();
  const simulateMutation = useSimulateAttackMutation();

  const isProcessing = defendMutation.isPending || simulateMutation.isPending;

  // Fake simulation removed - using real-time stream
  useEffect(() => {
    if (isProcessing && !defendMutation.isPending) {
        // Only run fake simulation for "Simulate Attack" button which doesn't stream yet
        // Or if we want to simulate for the `simulateMutation`
        if (simulateMutation.isPending) {
             // Keep fake simulation logic JUST for simulateMutation if needed
             // For now, let's just let simulateMutation return and show result
             // Or we can leave it empty if we don't want fake bars.
        } 
    }
  }, [isProcessing, simulateMutation.isPending]);

  useEffect(() => {
    if (defendMutation.isSuccess && defendMutation.data) {
      setResult(defendMutation.data);
      toast.success("Threat analysis complete!");
    }
  }, [defendMutation.isSuccess, defendMutation.data]);

  useEffect(() => {
    if (simulateMutation.isSuccess && simulateMutation.data) {
      setResult(simulateMutation.data);
      toast.success("Simulated attack analyzed!");
    }
  }, [simulateMutation.isSuccess, simulateMutation.data]);

  const handleDefend = (input: ThreatInput) => {
    setResult(null);
    setAgents(
        AGENTS.map((agent) => ({ ...agent, status: "processing", progress: 0 }))
    );
    
    // reset to idle initially, but we want to show 'processing' immediately?
    // Actually the stream will update them.

    defendMutation.mutate({
        input,
        onProgress: (partialResult) => {
             // Merge partial result into agents state
             if (partialResult.agents) {
                 setAgents(prev => {
                     // We need to map over AGENTS (static) or prev
                     const newAgents = [...prev];
                     partialResult.agents.forEach(updatedAgent => {
                         const idx = newAgents.findIndex(a => a.id === updatedAgent.id);
                         if (idx !== -1) {
                             newAgents[idx] = { ...newAgents[idx], ...updatedAgent };
                         }
                     });
                     return newAgents;
                 });
             }
             if (partialResult.findings || partialResult.overallRisk !== undefined) {
                 setResult(prev => {
                     if (!prev) {
                         // If no result yet, maybe create a partial one? 
                         // Or just wait for success? 
                         // But we want to show findings live.
                         // Let's cast partialResult to DefenseResult for now if needed, 
                         // but better to just merge if prev exists.
                         return { 
                             ...partialResult,
                             // Defaults for required fields if missing in partial
                             threatMap: partialResult.threatMap || [],
                             timeline: partialResult.timeline || [],
                             agents: partialResult.agents || [],
                             findings: partialResult.findings || [],
                             input: { type: input.type, data: typeof input.data === 'string' ? input.data : "" },
                             overallRisk: partialResult.overallRisk || 0,
                             severity: partialResult.severity || "low",
                             remediationSteps: partialResult.remediationSteps || [],
                             status: partialResult.status || "processing"
                         } as DefenseResult;
                     }
                     return { ...prev, ...partialResult } as DefenseResult;
                 });
             }
        }
    });
  };

  const handleSimulate = () => {
    simulateMutation.mutate();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner message="Loading session..." />
      </div>
    );

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Defense Dashboard</h1>
          <p className="text-gray-400">
            Input threat data to activate the 8-agent defense system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
          <div className="lg:col-span-1 space-y-6">
            <ThreatInputForm
              onDefend={handleDefend}
              onSimulate={handleSimulate}
              isLoading={isProcessing}
            />

            {isProcessing && (
              <div className="space-y-3">
                <h3 className="text-white">Agent Status</h3>
                {agents.map((agent) => (
                  <AgentProgressBar key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 min-h-[600px]">
            {isProcessing && (
              <Tabs defaultValue="simulation" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#111] border border-[#1e3a8a]/30 mb-4">
                  <TabsTrigger
                    value="simulation"
                    className="data-[state=active]:bg-[#1e3a8a]"
                  >
                    3D Simulation
                  </TabsTrigger>
                  <TabsTrigger
                    value="analysis"
                    className="data-[state=active]:bg-[#1e3a8a]"
                  >
                    Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="simulation" className="mt-0 min-h-[600px]">
                  <div className="h-full">
                    <AttackSimulation3D isActive={isProcessing} />
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="mt-0 min-h-[500px]">
                  <div className="bg-[#111] border border-[#1e3a8a]/30 rounded-lg p-12 h-full flex items-center justify-center">
                    <LoadingSpinner message="Analyzing threat with 8 AI agents..." />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {!isProcessing && result && (
              <div className="space-y-6">
                <ResultsCard result={result} />
                <ThreatGraph data={result.threatMap} />
              </div>
            )}

            {!isProcessing && !result && (
              <div className="bg-[#111] border border-[#1e3a8a]/30 rounded-lg p-12 min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 opacity-20">
                    <svg
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="url(#glowGradient)"
                        opacity="0.3"
                      />
                      <defs>
                        <radialGradient id="glowGradient">
                          <stop
                            offset="0%"
                            stopColor="#2563eb"
                            stopOpacity="0.6"
                          />
                          <stop
                            offset="100%"
                            stopColor="#1e3a8a"
                            stopOpacity="0"
                          />
                        </radialGradient>
                      </defs>
                      <circle
                        cx="60"
                        cy="60"
                        r="22"
                        fill="#1e3a8a"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white mb-2 text-2xl">Ready to Defend</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Enter threat data or simulate an attack to activate the
                    OctoDefender multi-agent system and watch the 3D
                    visualization
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
