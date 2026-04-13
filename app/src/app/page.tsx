"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { AnalyzedAnime, BeatCategory } from "@/types";
import AnalysisForm from "@/components/AnalysisForm";
import SidePanel from "@/components/SidePanel";
import AnimeSearch from "@/components/AnimeSearch";

const FlowGraph = dynamic(() => import("@/components/FlowGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="animate-spin h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full" />
    </div>
  ),
});

async function loadInitialData(): Promise<{ anime: AnalyzedAnime[]; categories: BeatCategory[] }> {
  const [animeRes, taxRes] = await Promise.all([
    fetch("/api/anime"),
    fetch("/api/taxonomy"),
  ]);
  const animeData = await animeRes.json();
  const taxData = await taxRes.json();
  return {
    anime: animeData.anime || [],
    categories: taxData.taxonomy?.categories || [],
  };
}

export default function Home() {
  const [anime, setAnime] = useState<AnalyzedAnime[]>([]);
  const [categories, setCategories] = useState<BeatCategory[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [highlightedAnimeId, setHighlightedAnimeId] = useState<string | null>(null);
  const [minAnimeCount, setMinAnimeCount] = useState(1);
  const [filterCategory, setFilterCategory] = useState("");
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const initialLoadRef = useRef<Promise<void> | null>(null);

  // Load data on first render (ref-guarded, no useEffect)
  if (initialLoadRef.current == null) {
    initialLoadRef.current = loadInitialData().then(({ anime: a, categories: c }) => {
      setAnime(a);
      setCategories(c);
    }).catch((error) => {
      console.error("Failed to load initial data:", error);
    });
  }

  const fetchData = useCallback(async () => {
    const data = await loadInitialData();
    setAnime(data.anime);
    setCategories(data.categories);
  }, []);

  const handleNodeClick = useCallback(
    (categoryName: string) => {
      setSelectedCategory(categoryName);
      setShowPanel(true);
      setSelectedAnimeId(null);
    },
    []
  );

  const handleSelectAnime = useCallback((id: string | null) => {
    setSelectedAnimeId(id);
    setHighlightedAnimeId(id);
  }, []);

  const handleDeleteAnime = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/anime?id=${id}`, { method: "DELETE" });
        await fetchData();
        setSelectedAnimeId(null);
        setHighlightedAnimeId(null);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    [fetchData]
  );

  const panelAnime = useMemo(() => {
    if (!selectedCategory) return anime;
    return anime.filter((a) =>
      a.beats.some((b) => {
        if (b.stage === "arrival" && b.arrivalDetail) {
          const { form, age, location } = b.arrivalDetail;
          const label = age
            ? `${form} ${age} in ${location}`
            : `${form} in ${location}`;
          return label === selectedCategory;
        }
        const cat = categories.find((c) => c.id === b.categoryId);
        return cat?.name === selectedCategory || b.categoryId === selectedCategory;
      })
    );
  }, [anime, categories, selectedCategory]);

  // Only show categories that have at least one anime
  const usedCategories = useMemo(() => {
    const used = new Set<string>();
    for (const a of anime) {
      for (const b of a.beats) {
        if (b.stage === "arrival" && b.arrivalDetail) {
          const { form, age, location } = b.arrivalDetail;
          const label = age ? `${form} ${age} in ${location}` : `${form} in ${location}`;
          used.add(label);
        } else {
          const cat = categories.find((c) => c.id === b.categoryId);
          if (cat) used.add(cat.name);
        }
      }
    }
    return Array.from(used).sort();
  }, [anime, categories]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
            <span className="text-purple-400">異世界</span> Isekai Analyzer
          </h1>
          <span className="text-gray-500 text-sm">
            {anime.length} anime analyzed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AnimeSearch
            anime={anime}
            onSelect={(id) => {
              setSelectedAnimeId(id);
              setHighlightedAnimeId(id);
              setShowPanel(true);
              setSelectedCategory(null);
            }}
          />
          <button
            onClick={() => setShowAnalyzer(!showAnalyzer)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            {showAnalyzer ? "Hide Analyzer" : "+ Analyze"}
          </button>
          <button
            onClick={() => {
              setShowPanel(true);
              setSelectedCategory(null);
              setSelectedAnimeId(null);
            }}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
          >
            All Anime
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Analyzer panel */}
          {showAnalyzer && (
            <div className="p-4 border-b border-gray-700 shrink-0">
              <AnalysisForm onAnalysisComplete={() => { fetchData(); setShowAnalyzer(false); }} />
            </div>
          )}

          {/* Graph controls */}
          <div className="px-4 py-2 flex items-center gap-4 bg-gray-800/50 border-b border-gray-700 shrink-0">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              Min anime:
              <input
                type="range"
                min={1}
                max={Math.max(5, anime.length)}
                value={minAnimeCount}
                onChange={(e) => setMinAnimeCount(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-white w-4">{minAnimeCount}</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              Category:
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1"
              >
                <option value="">All categories</option>
                {usedCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {highlightedAnimeId && (
              <button
                onClick={() => {
                  setHighlightedAnimeId(null);
                  setSelectedAnimeId(null);
                }}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Clear highlight
              </button>
            )}
          </div>

          {/* Flow graph */}
          <div className="flex-1">
            {anime.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-6xl mb-4">🌀</div>
                <h2 className="text-2xl font-bold mb-2">No Anime Analyzed Yet</h2>
                <p className="text-sm mb-4">
                  Start by analyzing an isekai anime to build the flow graph.
                </p>
                <button
                  onClick={() => setShowAnalyzer(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + Analyze Your First Anime
                </button>
              </div>
            ) : (
              <FlowGraph
                anime={anime}
                categories={categories}
                onNodeClick={handleNodeClick}
                highlightedAnimeId={highlightedAnimeId}
                minAnimeCount={minAnimeCount}
                filterCategory={filterCategory}
              />
            )}
          </div>
        </div>

        {/* Side panel */}
        {showPanel && (
          <SidePanel
            anime={panelAnime}
            selectedCategory={selectedCategory}
            selectedAnimeId={selectedAnimeId}
            onSelectAnime={handleSelectAnime}
            onDeleteAnime={handleDeleteAnime}
            onClose={() => {
              setShowPanel(false);
              setHighlightedAnimeId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
