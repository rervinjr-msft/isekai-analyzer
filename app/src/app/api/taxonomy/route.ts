import { NextResponse } from "next/server";
import { getTaxonomy } from "@/lib/storage";

export async function GET() {
  try {
    const taxonomy = getTaxonomy();
    return NextResponse.json({ taxonomy });
  } catch (error) {
    console.error("Error loading taxonomy:", error);
    return NextResponse.json({ error: "Failed to load taxonomy" }, { status: 500 });
  }
}
