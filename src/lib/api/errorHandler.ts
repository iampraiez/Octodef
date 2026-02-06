import { NextResponse } from "next/server";

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleAPIError(error: unknown): NextResponse {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    // Known error types
    if (error.message.includes("Invalid input")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error.message.includes("Rate limit")) {
      return NextResponse.json(
        { error: "Too Many Requests. Please try again later." },
        { status: 429 }
      );
    }
    
    if (error.message.includes("Database")) {
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      );
    }
  }
  
  // Generic error
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Validate request data
 */
export function validateDefenseRequest(data: unknown, type: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!data || typeof data !== "string") {
    return { valid: false, error: "Data must be a non-empty string" };
  }
  
  const validTypes = ["url", "ip", "hash", "log", "email"];
  if (!type || !validTypes.includes(type as string)) {
    return {
      valid: false,
      error: `Type must be one of: ${validTypes.join(", ")}`,
    };
  }
  
  return { valid: true };
}
