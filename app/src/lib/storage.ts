import fs from "fs";
import path from "path";
import { AppData, AnalyzedAnime, BeatCategory, Taxonomy } from "@/types";
import { SEED_TAXONOMY } from "./taxonomy";

const DATA_DIR = process.env.ISEKAI_DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "isekai-data.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultData(): AppData {
  return {
    anime: [],
    taxonomy: { categories: [...SEED_TAXONOMY] },
  };
}

export function loadData(): AppData {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    console.error("Corrupt data file detected, resetting to defaults");
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getAnimeList(): AnalyzedAnime[] {
  return loadData().anime;
}

export function getAnimeByAnilistId(anilistId: number): AnalyzedAnime | undefined {
  return loadData().anime.find((a) => a.anilistId === anilistId);
}

export function addAnime(anime: AnalyzedAnime): void {
  const data = loadData();
  data.anime.push(anime);
  saveData(data);
}

export function deleteAnime(id: string): boolean {
  const data = loadData();
  const idx = data.anime.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  data.anime.splice(idx, 1);
  saveData(data);
  return true;
}

export function getTaxonomy(): Taxonomy {
  return loadData().taxonomy;
}

export function addCategory(category: BeatCategory): void {
  const data = loadData();
  data.taxonomy.categories.push(category);
  saveData(data);
}

export function findCategoryByName(stage: string, name: string): BeatCategory | undefined {
  const data = loadData();
  return data.taxonomy.categories.find(
    (c) => c.stage === stage && c.name.toLowerCase() === name.toLowerCase()
  );
}
