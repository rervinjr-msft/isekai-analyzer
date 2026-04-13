import { AniListSearchResult } from "@/types";

const ANILIST_API = "https://graphql.anilist.co";

const SEARCH_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        medium
      }
      genres
    }
  }
}
`;

const GET_BY_ID_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      english
      romaji
      native
    }
    coverImage {
      medium
    }
    genres
  }
}
`;

async function anilistFetch(query: string, variables: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function searchAnime(search: string): Promise<AniListSearchResult[]> {
  const data = (await anilistFetch(SEARCH_QUERY, { search })) as {
    data: { Page: { media: AniListSearchResult[] } };
  };
  return data.data.Page.media;
}

export async function getAnimeById(id: number): Promise<AniListSearchResult | null> {
  const data = (await anilistFetch(GET_BY_ID_QUERY, { id })) as {
    data: { Media: AniListSearchResult | null };
  };
  return data.data.Media;
}

export function getCanonicalTitle(result: AniListSearchResult): string {
  return result.title.english && result.title.english.trim() !== ""
    ? result.title.english
    : result.title.romaji;
}
