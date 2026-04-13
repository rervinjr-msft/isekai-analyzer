import { NextRequest, NextResponse } from "next/server";
import { getAnimeList, deleteAnime, addAnime, loadData, addCategory, findCategoryByName } from "@/lib/storage";
import { AnalyzedAnime, Beat, BeatCategory } from "@/types";

export async function GET() {
  try {
    const anime = getAnimeList();
    return NextResponse.json({ anime });
  } catch (error) {
    console.error("Error loading anime:", error);
    return NextResponse.json({ error: "Failed to load anime" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anime, newCategories } = body as {
      anime: AnalyzedAnime;
      newCategories?: Array<{ stage: string; name: string }>;
    };

    // Add any new categories first
    if (newCategories) {
      for (const nc of newCategories) {
        const existing = findCategoryByName(nc.stage, nc.name);
        if (!existing) {
          const category: BeatCategory = {
            id: `${nc.stage}-${nc.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`,
            stage: nc.stage as BeatCategory["stage"],
            name: nc.name,
            isUserAdded: true,
          };
          addCategory(category);
        }
      }
    }

    // Assign category IDs to beats
    const data = loadData();
    const beats: Beat[] = anime.beats.map((beat) => {
      let categoryId: string;

      if (beat.stage === "arrival" && beat.arrivalDetail) {
        const { form, age, location } = beat.arrivalDetail;
        const label = age ? `${form} ${age} in ${location}` : `${form} in ${location}`;
        categoryId = `arrival-${label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

        // Ensure arrival category exists
        const existingCat = data.taxonomy.categories.find((c) => c.id === categoryId);
        if (!existingCat) {
          addCategory({
            id: categoryId,
            stage: "arrival",
            name: label,
            isUserAdded: false,
          });
        }
      } else {
        const cat = data.taxonomy.categories.find(
          (c) => c.stage === beat.stage && c.name.toLowerCase() === beat.categoryId.toLowerCase()
        );
        categoryId = cat?.id || beat.categoryId;
      }

      return {
        ...beat,
        categoryId,
      };
    });

    const finalAnime: AnalyzedAnime = {
      ...anime,
      beats,
    };

    addAnime(finalAnime);
    return NextResponse.json({ anime: finalAnime });
  } catch (error) {
    console.error("Error saving anime:", error);
    return NextResponse.json({ error: "Failed to save anime" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }
    const deleted = deleteAnime(id);
    if (!deleted) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting anime:", error);
    return NextResponse.json({ error: "Failed to delete anime" }, { status: 500 });
  }
}
