import { AgentContext, AgentResponse } from "./types";

export async function runScout(context: AgentContext): Promise<AgentResponse> {
  const { input, type } = context;
  const findings = [];
  
  // Basic validation & formatting
  let isValid = true;
  let details = "";

  switch (type) {
    case "ip":
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      // simple ipv6 check
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      if (!ipv4Regex.test(input) && !ipv6Regex.test(input)) {
        isValid = false;
        details = "Invalid IP address format";
      } else {
        details = "Valid IP address format detected";
      }
      break;
    case "url":
      try {
        new URL(input);
        details = "Valid URL structure";
      } catch {
        isValid = false;
        details = "Invalid URL structure";
      }
      break;
    case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(input)) {
            isValid = false;
            details = "Invalid email format";
        } else {
            details = "Valid email syntax";
        }
        break;
    // ... add more types
  }

  if (!isValid) {
      findings.push({
          agent: "Scout",
          type: "warning",
          message: "Malformed Input Detected",
          details
      });
  } else {
      findings.push({
          agent: "Scout",
          type: "info",
          message: "Input Verified",
          details
      });
  }

  return {
    name: "Scout",
    status: "complete",
    findings,
    data: { isValid }
  };
}
