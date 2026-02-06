import { NextRequest, NextResponse } from "next/server";
import { getCollections } from "@/lib/db";
import { getUserTrackingData } from "@/lib/userTracking";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const { ip } = getUserTrackingData(req.headers);
  
  // Rate limiting: 5 feedback submissions per hour per IP
  if (!rateLimit(ip, { interval: 60 * 60 * 1000, limit: 5 })) {
    return NextResponse.json(
      { error: "Too many feedback submissions. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { message, email, name } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const trackingData = getUserTrackingData(req.headers);
    const { feedbackCollection } = await getCollections();

    await feedbackCollection.insertOne({
      ...trackingData,
      message: message.trim(),
      email: email?.trim() || null,
      name: name?.trim() || null,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
