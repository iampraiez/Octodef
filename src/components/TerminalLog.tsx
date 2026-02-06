import { useEffect, useRef } from "react";
import { Finding, TimelineEvent } from "@/types/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

interface TerminalLogProps {
  logs: TimelineEvent[];
  findings: Finding[];
}

export function TerminalLog({ logs, findings }: TerminalLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Merge and sort logs + findings by time/insertion order for display
  const entries = [
    ...logs.map((l) => ({ type: "log", ...l, timestamp: l.time })),
    ...findings.map((f) => ({
      type: "finding",
      agent: f.agent,
      event: `[${f.type.toUpperCase()}] ${f.message}`,
      timestamp: new Date().toISOString(), // Keep this for now as findings lack timestamps in type definition
      color:
        f.type === "critical"
          ? "text-red-500"
          : f.type === "warning"
          ? "text-yellow-500"
          : "text-blue-400",
    })),
  ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length, findings.length]);

  return (
    <div className="bg-black/90 border border-green-500/30 rounded-lg font-mono text-sm overflow-hidden flex flex-col h-full shadow-[0_0_30px_rgba(0,255,0,0.05)]">
      <div className="bg-green-900/10 p-2 border-b border-green-500/20 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-green-500" />
        <span className="text-green-500 text-xs uppercase">OCTODEF_SECURE_LINK // {new Date().toLocaleDateString()}</span>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-gray-600 select-none">
                {new Date().toLocaleTimeString()}
              </span>
              <span className="text-green-700 select-none">{">"}</span>
              <span className="text-purple-400 font-bold min-w-[80px]">
                {entry.agent}:
              </span>
              <span
                className={
                  (entry as any).color || "text-gray-300"
                }
              >
                {entry.event}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
