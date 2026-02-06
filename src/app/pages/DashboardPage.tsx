"use client";
export const dynamic = "force-dynamic";

import { ThreatInputForm } from "@/components/ThreatInputForm";
import { ResultsCard } from "@/components/ResultsCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useDashboardState } from "@/hooks/useDashboardState";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCcw, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { agents, result, isProcessing, handleDefend, handleSimulate } =
    useDashboardState();

  const handleReset = () => {
     window.location.reload(); 
  };

  // Calculate overall progress based on agent completion
  const completedAgents = agents.filter(a => a.status === 'complete' || a.status === 'error').length;
  const progress = isProcessing 
      ? Math.max(10, (completedAgents / agents.length) * 100) 
      : (result ? 100 : 0);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black flex flex-col pt-32 pb-12 items-center">
        <div className="w-full max-w-3xl px-6 space-y-12">
          
          {/* Header - Always Clean */}
          <div className="text-center space-y-4">
             <div className="w-20 h-20 mx-auto bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <div className="w-12 h-12 bg-blue-500 rounded-full blur-xl opacity-50" />
             </div>
             <h1 className="text-5xl font-bold text-white tracking-tight">
                Octo<span className="text-blue-500">Def</span> Console
             </h1>
          </div>

          <AnimatePresence mode="wait">
            {!isProcessing && !result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="input"
                className="w-full"
              >
                  <ThreatInputForm
                    onDefend={handleDefend}
                    onSimulate={handleSimulate}
                    isLoading={isProcessing}
                  />
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 key="processing"
                 className="w-full max-w-md mx-auto text-center space-y-6"
              >
                  <div className="space-y-2">
                     <p className="text-white text-lg">Analyzing Threat Vector...</p>
                     <p className="text-gray-500 text-sm">Querying global intelligence databases</p>
                  </div>
                  <Progress value={progress} className="h-1 bg-white/10" indicatorClassName="bg-white" />
                  <div className="text-xs text-gray-600 font-mono">
                     {completedAgents} / {agents.length} AGENTS REPORTING
                  </div>
              </motion.div>
            )}

            {result && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key="results"
                className="space-y-8"
              >
                 <ResultsCard result={result} />
                 
                 <div className="flex justify-center">
                    <Button variant="ghost" onClick={handleReset} className="text-gray-400 hover:text-white">
                       <RefreshCcw className="w-4 h-4 mr-2" />
                       Analyze Another Threat
                    </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </ErrorBoundary>
  );
}

