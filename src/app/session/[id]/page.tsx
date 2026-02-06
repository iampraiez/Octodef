"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResultsCard } from "@/components/ResultsCard";
import { ThreatGraph } from "@/components/ThreatGraph";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DefenseResult } from "@/types/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function SessionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [result, setResult] = useState<DefenseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/session/${id}`);
        setResult(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load session details. It may not exist or has been deleted.");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner message="Loading session data..." />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl text-red-500 font-bold">Error</h1>
          <p className="text-gray-400">{error || "Session not found"}</p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl text-white font-bold">Session Details</h1>
              <p className="text-gray-400 text-sm">
                ID: <span className="font-mono text-blue-400">{id}</span>
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        <div className="space-y-8">
          <ResultsCard result={result} />
          
          <div className="bg-[#111] border border-[#1e3a8a]/30 rounded-lg p-6">
             <h3 className="text-xl text-white mb-6 font-semibold">Threat Map</h3>
             <ThreatGraph data={result.threatMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
