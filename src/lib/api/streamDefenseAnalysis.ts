import { analyzeThreat } from "@/lib/defense_orcestrator";
import { saveDefenseResult } from "./defenseResultsService";
import { ThreatType } from "@/types/types";

interface UserTrackingData {
  fingerprint: string;
  ip: string;
  userAgent: string;
}

/**
 * Stream defense analysis results to the client
 */
export async function streamDefenseAnalysis(
  data: string,
  type: ThreatType,
  trackingData: UserTrackingData
): Promise<Response> {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Run analysis with progress callback
        const finalResult = await analyzeThreat(data, type, (progress) => {
          try {
            const chunk = JSON.stringify(progress) + "\n";
            controller.enqueue(encoder.encode(chunk));
          } catch (error) {
            console.error("Error encoding progress:", error);
          }
        });

        // Save final result to database
        try {
          const insertedId = await saveDefenseResult(
            {
              ...finalResult,
              timestamp: new Date().toISOString(),
            },
            trackingData.fingerprint,
            trackingData.ip,
            trackingData.userAgent
          );

          // Send final ID to client
          const finalChunk = JSON.stringify({ _id: insertedId }) + "\n";
          controller.enqueue(encoder.encode(finalChunk));
        } catch (dbError) {
          console.error("Failed to save result, but analysis completed:", dbError);
          // Don't fail the stream if DB save fails
        }
        
        controller.close();
      } catch (error) {
        console.error("Analysis error:", error);
        
        // Send error to client
        const errorChunk = JSON.stringify({
          status: "failed",
          error: error instanceof Error ? error.message : "Analysis failed",
        }) + "\n";
        
        controller.enqueue(encoder.encode(errorChunk));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
