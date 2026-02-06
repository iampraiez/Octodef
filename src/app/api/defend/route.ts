export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Session } from "@/types/types";
import { analyzeThreat } from "@/lib/defense_orcestrator";
import { ObjectId } from "mongodb";
import { getCollections } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function GET() {
  try {
    const { user } = (await auth()) as Session;
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { defenseResultCollection } = await getCollections();
    const results = await defenseResultCollection
      .find({ userId: user.email })
      .sort({ timestamp: -1 })
      .toArray();
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Error fetching results" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  
  // Rate limiting: 10 requests per minute per IP
  if (!rateLimit(ip, { interval: 60 * 1000, limit: 10 })) {
     return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { data, type } = await req.json();
    const session = (await auth()) as Session | null;
    const userEmail = session?.user?.email || null;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const finalResult = await analyzeThreat(data, type, (progress) => {
             const chunk = JSON.stringify(progress) + "\n";
             controller.enqueue(encoder.encode(chunk));
          });

          const { defenseResultCollection } = await getCollections();
          await defenseResultCollection.insertOne({
            ...finalResult,
            timestamp: new Date().toISOString(),
            userId: userEmail || '',
          });
          
          // Send final "complete" state if needed, though onProgress probably covered it
          // Use a special "done" marker or just ensure the last onProgress was complete
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "X-Content-Type-Options": "nosniff",
        }
    });

  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = (await auth()) as Session;
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionIds } = await request.json();
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json(
        { error: "Session IDs array is required" },
        { status: 400 }
      );
    }

    const validSessionIds = sessionIds
      .map((id) => {
        try {
          return new ObjectId(id);
        } catch {
          return null;
        }
      })
      .filter((id): id is ObjectId => id !== null);

    const { defenseResultCollection } = await getCollections();

    const response = await defenseResultCollection.deleteMany({
      _id: { $in: validSessionIds },
      userId: user.email,
    });

    return NextResponse.json({
      success: true,
      deletedCount: response.deletedCount,
      message: `${response.deletedCount} session(s) deleted successfully`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete sessions" },
      { status: 500 }
    );
  }
}
