export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { getUserTrackingData } from "@/lib/userTracking";
import {
  getDefenseResults,
  deleteDefenseResults,
} from "@/lib/api/defenseResultsService";
import { streamDefenseAnalysis } from "@/lib/api/streamDefenseAnalysis";
import {
  handleAPIError,
  createErrorResponse,
  validateDefenseRequest,
} from "@/lib/api/errorHandler";
import { ThreatType } from "@/types/types";

/**
 * GET /api/defend
 * Fetch defense results for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const { fingerprint } = getUserTrackingData(req.headers);
    const results = await getDefenseResults(fingerprint);
    return NextResponse.json(results);
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * POST /api/defend
 * Start a new defense analysis with streaming response
 */
export async function POST(req: NextRequest) {
  try {
    const trackingData = getUserTrackingData(req.headers);
    
    // Rate limiting: 10 requests per minute per IP
    if (!rateLimit(trackingData.ip, { interval: 60 * 1000, limit: 10 })) {
      return createErrorResponse(
        "Too Many Requests. Please try again later.",
        429
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { data, type } = body;
    
    const validation = validateDefenseRequest(data, type);
    if (!validation.valid) {
      return createErrorResponse(validation.error!, 400);
    }

    // Stream the analysis
    return await streamDefenseAnalysis(
      data,
      type as ThreatType,
      trackingData
    );
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/defend
 * Delete defense results by session IDs
 */
export async function DELETE(req: NextRequest) {
  try {
    const { fingerprint } = getUserTrackingData(req.headers);
    const { sessionIds } = await req.json();
    
    const result = await deleteDefenseResults(fingerprint, sessionIds);
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} session(s) deleted successfully`,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
