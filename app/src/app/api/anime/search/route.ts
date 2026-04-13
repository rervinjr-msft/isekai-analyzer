import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/anilist";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }
    const results = await searchAnime(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("AniList search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
