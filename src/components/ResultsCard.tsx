
import {AlertTriangle, CheckCircle, Shield, Activity, 
  Terminal, FileJson, ChevronDown, Download, Share2, 
  ExternalLink, Search, Lock, Zap, Brain, Eye, Info
} from "lucide-react";
import { DefenseResult, Finding } from "../types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ResultsCardProps {
  result: DefenseResult;
}

export const ResultsCard = ({ result }: ResultsCardProps) => {
  const getSeverityHelper = (severity: string) => {
    switch (severity) {
      case "critical": return { color: "text-red-500", bg: "bg-red-500", border: "border-red-500" };
      case "high": return { color: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500" };
      case "medium": return { color: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500" };
      case "low": return { color: "text-green-500", bg: "bg-green-500", border: "border-green-500" };
      default: return { color: "text-gray-500", bg: "bg-gray-500", border: "border-gray-500" };
    }
  };

  const sev = getSeverityHelper(result.severity);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `octodef-report-${result._id}.json`;
    link.click();
    toast.success("JSON Report exported");
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/session/${result._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Secure link copied");
  };

  const criticalFindings = result.findings.filter(f => f.type === 'critical' || f.type === 'error');
  const warningFindings = result.findings.filter(f => f.type === 'warning');
  const infoFindings = result.findings.filter(f => f.type === 'info');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. REPORT HEADER & SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Gauge */}
        <Card className="md:col-span-1 bg-[#0a0a0a] border-[#333] flex flex-col justify-center items-center py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-900/10 pointer-events-none" />
          <div className="relative z-10 text-center space-y-2">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="64" cy="64" r="60" stroke="#222" strokeWidth="8" fill="none" />
                 <circle 
                    cx="64" cy="64" r="60" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={377} 
                    strokeDashoffset={377 - (377 * result.overallRisk) / 100}
                    className={`${sev.color} transition-all duration-1000 ease-out`}
                  />
               </svg>
               <div className="absolute flex flex-col items-center">
                 <span className={`text-4xl font-bold ${sev.color}`}>{result.overallRisk}</span>
                 <span className="text-xs text-gray-500">RISK SCORE</span>
               </div>
            </div>
            <Badge variant="outline" className={`${sev.color} ${sev.border} bg-transparent`}>
               {result.severity.toUpperCase()} ILLEGALITY
            </Badge>
          </div>
        </Card>

        {/* Audit Details */}
        <Card className="md:col-span-2 bg-[#0a0a0a] border-[#333]">
           <CardHeader className="pb-2">
             <div className="flex justify-between items-start">
               <div>
                 <CardTitle className="text-xl text-white flex items-center gap-2">
                   <Shield className="w-5 h-5 text-blue-500" />
                   Security Assessment Report
                 </CardTitle>
                 <CardDescription className="font-mono text-xs pt-1">
                   ID: {result._id ? String(result._id).substring(0, 24) : 'N/A'} • {new Date(result.timestamp).toUTCString()}
                 </CardDescription>
               </div>
               <div className="flex gap-2">
                 <Button size="icon" variant="ghost" onClick={handleExportJSON} title="Export JSON">
                    <Download className="w-4 h-4" />
                 </Button>
                 <Button size="icon" variant="ghost" onClick={handleCopyShareLink} title="Share Link">
                    <Share2 className="w-4 h-4" />
                 </Button>
               </div>
             </div>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                    <p className="text-gray-400 text-xs uppercase mb-1">Threat Vector</p>
                    <div className="flex items-center gap-2 text-white">
                       {result.input.type === 'url' ? <ExternalLink className="w-4 h-4 text-blue-400"/> : <Terminal className="w-4 h-4 text-green-400"/>}
                       <span className="truncate font-mono text-sm">{result.input.data}</span>
                    </div>
                 </div>
                 <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                    <p className="text-gray-400 text-xs uppercase mb-1">Detections</p>
                    <div className="flex items-center gap-4 text-sm font-mono">
                        <span className="text-red-400">{criticalFindings.length} CRIT</span>
                        <span className="text-yellow-400">{warningFindings.length} WARN</span>
                        <span className="text-blue-400">{infoFindings.length} INFO</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                   <span>Analysis Confidence</span>
                   <span>98.6%</span>
                </div>
                <Progress value={98} className="h-1 bg-[#222]" indicatorClassName="bg-blue-600" />
              </div>
           </CardContent>
        </Card>
      </div>

      {/* 2. COMPREHENSIVE TABS */}
      <Tabs defaultValue="findings" className="w-full">
        <ScrollArea className="w-full border-b border-[#333]">
           <TabsList className="w-full justify-start bg-[#0a0a0a] h-12 p-1 inline-flex min-w-[500px] md:min-w-0">
            <TabsTrigger value="findings" className="data-[state=active]:bg-[#222]">Detailed Findings</TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-[#222]">Agent Breakdown</TabsTrigger>
            <TabsTrigger value="remediation" className="data-[state=active]:bg-[#222]">Remediation Plan</TabsTrigger>
            <TabsTrigger value="raw" className="data-[state=active]:bg-[#222]">Raw Data</TabsTrigger>
          </TabsList>
        </ScrollArea>
        
        {/* FINDINGS TAB */}
        <TabsContent value="findings" className="space-y-4 mt-4">
           {criticalFindings.length > 0 && (
             <Section title="Critical Threats" icon={AlertTriangle} color="text-red-500" findings={criticalFindings} />
           )}
           {warningFindings.length > 0 && (
             <Section title="Security Warnings" icon={AlertTriangle} color="text-yellow-500" findings={warningFindings} />
           )}
           {infoFindings.length > 0 && (
             <Section title="Informational" icon={Info} color="text-blue-500" findings={infoFindings} />
           )}
           {result.findings.length === 0 && (
             <div className="bg-[#0a0a0a] border border-green-900/30 rounded-lg p-8 md:p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium">No Threats Detected</h3>
                <p className="text-gray-400">All 8 agents reported clean status.</p>
             </div>
           )}
        </TabsContent>

        {/* AGENTS TAB */}
        <TabsContent value="agents" className="mt-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.agents.map((agent) => (
                <Card key={agent.id} className="bg-[#0a0a0a] border-[#333]">
                   <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                         <h4 className="font-semibold text-white capitalize text-sm">{agent.name}</h4>
                         {agent.status === 'complete' ? <CheckCircle className="w-3 h-3 text-green-500"/> : <Activity className="w-3 h-3 text-blue-500"/>}
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">{agent.id}</p>
                      <div className="pt-2 border-t border-[#222] text-xs font-mono text-gray-300 truncate">
                         {agent.result || "Analysis Complete"}
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>

        {/* REMEDIATION TAB */}
        <TabsContent value="remediation" className="mt-4">
           <Card className="bg-[#0a0a0a] border-[#333]">
             <CardContent className="p-4 md:p-6">
                <ol className="relative border-l border-gray-800 ml-3 my-2">                  
                  {result.remediationSteps.map((step, i) => (
                    <li key={i} className="mb-8 ml-6 last:mb-0">            
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-900 rounded-full -left-3 ring-4 ring-black">
                             <span className="text-xs text-blue-200">{i+1}</span>
                        </span>
                        <h3 className="flex items-center mb-1 text-base md:text-lg font-semibold text-white">Action Item {i+1}</h3>
                        <p className="text-sm md:text-base font-normal text-gray-400">{step}</p>
                    </li>
                  ))}
                  {result.remediationSteps.length === 0 && (
                     <li className="ml-6">
                        <h3 className="text-white">No remediation required.</h3>
                        <p className="text-gray-500">System is secure.</p>
                     </li>
                  )}
                </ol>
             </CardContent>
           </Card>
        </TabsContent>

        {/* RAW DATA TAB */}
        <TabsContent value="raw" className="mt-4">
           <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 font-mono text-xs overflow-auto max-h-[500px]">
              <pre className="text-green-400/80 whitespace-pre-wrap break-all">
                 {JSON.stringify(result, null, 2)}
              </pre>
           </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

const Section = ({ title, icon: Icon, color, findings }: { title: string, icon: any, color: string, findings: Finding[] }) => (
  <Card className="bg-[#0a0a0a] border-[#333]">
     <CardHeader className="py-3 px-4 border-b border-[#222] bg-[#111]/50">
        <h3 className={`text-sm font-bold flex items-center gap-2 ${color}`}>
           <Icon className="w-4 h-4" />
           {title} <span className="text-gray-600 text-xs ml-auto font-mono">/ {findings.length} ITEMS</span>
        </h3>
     </CardHeader>
     <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
           {findings.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-[#222] last:border-0 px-3 md:px-4">
                 <AccordionTrigger className="hover:no-underline py-3 text-left">
                    <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3 w-full">
                       <code className="text-[10px] md:text-xs text-gray-500 min-w-[80px] pt-1 uppercase">{f.agent}</code>
                       <div className="flex-1">
                          <p className={`text-sm ${color === 'text-red-500' ? 'text-red-200' : 'text-gray-200'}`}>{f.message}</p>
                       </div>
                    </div>
                 </AccordionTrigger>
                 {f.details && (
                    <AccordionContent className="md:pl-[92px] pb-3">
                       <div className="bg-black/50 p-3 rounded border border-[#222] font-mono text-xs text-gray-400 break-words">
                          {f.details}
                       </div>
                    </AccordionContent>
                 )}
              </AccordionItem>
           ))}
        </Accordion>
     </CardContent>
  </Card>
);
