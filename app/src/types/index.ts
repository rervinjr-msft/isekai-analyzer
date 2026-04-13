/** Core types for the Isekai Story Beat Analyzer */

export type StoryStage = "departure" | "transition" | "arrival" | "powers";

export interface ArrivalDetail {
  form: string;
  age: string | null;
  location: string;
}

export interface Beat {
  id: string;
  stage: StoryStage;
  categoryId: string;
  rawText: string;
  /** Only present for arrival beats */
  arrivalDetail?: ArrivalDetail;
}

export interface BeatCategory {
  id: string;
  stage: StoryStage;
  name: string;
  /** Whether this is a seed category or user-added */
  isUserAdded: boolean;
}

export interface AnalyzedAnime {
  id: string;
  anilistId: number;
  title: string;
  beats: Beat[];
  isIsekai: boolean;
  confidence: number;
  explanation: string;
  analyzedAt: string;
}

export interface Taxonomy {
  categories: BeatCategory[];
}

export interface AppData {
  anime: AnalyzedAnime[];
  taxonomy: Taxonomy;
}

export interface AniListSearchResult {
  id: number;
  title: {
    english: string | null;
    romaji: string;
    native: string | null;
  };
  coverImage?: {
    medium?: string;
  };
  genres?: string[];
}

export interface ClassificationResult {
  isIsekai: boolean;
  confidence: number;
  explanation: string;
}

export interface ExtractedBeat {
  stage: StoryStage;
  categoryName: string;
  rawText: string;
  arrivalDetail?: ArrivalDetail;
}

export interface ExtractionResult {
  beats: ExtractedBeat[];
  proposedCategories: Array<{
    stage: StoryStage;
    name: string;
  }>;
}
