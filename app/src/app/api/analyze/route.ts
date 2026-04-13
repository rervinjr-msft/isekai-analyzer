import { NextRequest, NextResponse } from "next/server";
import { classifyIsekai, extractBeats } from "@/lib/openai";
import { getAnimeByAnilistId, loadData } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anilistId, title, override } = body as {
      anilistId: number;
      title: string;
      override?: boolean;
    };

    // Check for existing analysis
    const existing = getAnimeByAnilistId(anilistId);
    if (existing) {
      return NextResponse.json({ anime: existing, cached: true });
    }

    // Step 1: Classify
    const classification = await classifyIsekai(title);

    // If not isekai and no override, return classification only
    if (!classification.isIsekai && !override && classification.confidence < 0.3) {
      return NextResponse.json({
        classification,
        needsOverride: false,
        rejected: true,
      });
    }

    if (!classification.isIsekai && !override) {
      return NextResponse.json({
        classification,
        needsOverride: true,
        rejected: false,
      });
    }

    // Step 2: Extract beats
    const data = loadData();
    const extraction = await extractBeats(title, data.taxonomy.categories);

    return NextResponse.json({
      classification,
      extraction,
      anilistId,
      title,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
