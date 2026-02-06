"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DefenseResult, DefenseSession, ThreatInput } from "../types/types";
import { generateMockDefenseResult } from "../lib/mockData";
import axios from "axios";

const isClient = typeof window !== "undefined";


const defendThreat = async (
  { input, onProgress }: { input: ThreatInput; onProgress?: (data: DefenseResult) => void }
): Promise<DefenseResult> => {
  const response = await fetch(`/api/defend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok || !response.body) {
     throw new Error(response.statusText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastResult: DefenseResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          const update = JSON.parse(line);
          lastResult = update;
          if (onProgress) onProgress(update);
        } catch {
          console.error("Error parsing stream chunk");
        }
      }
    }
  }

  if (buffer.trim()) {
      try {
          const update = JSON.parse(buffer);
          lastResult = update;
          if (onProgress) onProgress(update);
      } catch { /* ignore */ }
  }

  if (!lastResult) throw new Error("No data received");
  return lastResult;
};



const simulateAttack = async (): Promise<DefenseResult> => {
  const types: ThreatInput["type"][] = ["url", "ip", "hash", "log", "email"];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const mockData = {
    url: "https://malicious-phishing-site.evil/steal-credentials",
    ip: "203.0.113.42",
    hash: "e99a18c428cb38d5f260853678922e03",
    log: '{"event":"unauthorized_access","source":"192.168.1.50","timestamp":"2025-10-18T12:34:56Z"}',
    email:
      "From: ceo@company-fake.com\nSubject: URGENT: Wire Transfer Required",
  };

  const input: ThreatInput = {
    type: randomType,
    data: mockData[randomType],
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockDefenseResult(input));
    }, 2000);
  });
};

const fetchPastSessions = async (): Promise<DefenseSession[]> => {
  const response = await axios.get(`/api/defend`);
  const past_collections = response.data.map((col: DefenseResult) => ({
    _id: col._id,
    timestamp: col.timestamp,
    input: col.input,
    status: col.status || "complete",
    overallRisk: col.overallRisk,
    severity: col.severity,
  })) as DefenseSession[];
  return past_collections;
};

const fetchSessionDetails = async (
  id: string
): Promise<DefenseResult | null> => {
  const response = await axios.get(`/api/session/${id}`);
  return response.data;
};

const deleteSessions = async (sessionIds: string[]): Promise<void> => {
  await axios.delete(`/api/defend`, {
    data: { sessionIds },
  });
};

export const useDefendMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: defendThreat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastSessions"] });
    },
  });
};


export const useSimulateAttackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: simulateAttack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastSessions"] });
    },
  });
};

export const usePastSessions = () => {
  return useQuery({
    queryKey: ["pastSessions"],
    queryFn: fetchPastSessions,
    staleTime: 5 * 60 * 1000,
    enabled: isClient,
  });
};

export const useSessionDetails = (id: string) => {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => fetchSessionDetails(id),
    staleTime: 10 * 60 * 1000,
    enabled: isClient && !!id,
  });
};

export const useDeleteSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastSessions"] });
    },
  });
};
