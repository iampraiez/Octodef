import { AgentStatus } from "@/types/types";
import { motion } from "framer-motion";
import { 
  Eye, Shield, Brain, Lock, Zap, Cpu, Bell, Cog, 
  Loader2, CheckCircle2, AlertTriangle 
} from "lucide-react";

interface AgentGridProps {
  agents: AgentStatus[];
}

const icons = {
  scout: Eye,
  sentinel: Shield,
  analyst: Brain,
  isolator: Lock,
  remediator: Zap,
  learner: Cpu,
  alerter: Bell,
  orchestrator: Cog,
};

export function AgentGrid({ agents }: AgentGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {agents.map((agent) => {
        const Icon = icons[agent.id as keyof typeof icons] || Cog;
        const isActive = agent.status === "processing";
        const isComplete = agent.status === "complete";
        const isError = agent.status === "error";

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              relative overflow-hidden rounded-xl border p-4 transition-colors
              ${isActive ? "bg-[#1e3a8a]/10 border-[#1e3a8a] shadow-[0_0_20px_rgba(30,58,138,0.3)]" : ""}
              ${isComplete ? "bg-[#065f46]/10 border-[#065f46]" : ""}
              ${isError ? "bg-red-900/10 border-red-500" : ""}
              ${agent.status === 'idle' ? "bg-[#111] border-[#333]" : ""}
            `}
          >
            {/* Background Pulse for Active */}
            {isActive && (
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
            )}

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/20' : 'bg-gray-800/50'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
              </div>
              <div className="text-xs font-mono">
                {isActive && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                {isComplete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {isError && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-sm font-semibold text-white mb-1">{agent.name}</h4>
              <p className="text-xs text-gray-400 truncate h-5">
                {agent.result || (isActive ? "Analyzing..." : "Waiting")}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-gray-800 w-full">
              <motion.div 
                className={`h-full ${isError ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${agent.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
