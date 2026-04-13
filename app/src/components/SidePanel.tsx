"use client";

import { AnalyzedAnime, StoryStage, formatArrivalLabel } from "@/types";

interface SidePanelProps {
  anime: AnalyzedAnime[];
  selectedCategory: string | null;
  selectedAnimeId: string | null;
  onSelectAnime: (id: string | null) => void;
  onDeleteAnime: (id: string) => void;
  onClose: () => void;
}

const STAGE_LABELS: Record<StoryStage, string> = {
  departure: "Departure",
  transition: "Transition",
  arrival: "Arrival",
  powers: "Powers",
};

const STAGE_COLORS: Record<StoryStage, string> = {
  departure: "bg-red-900/50 text-red-300 border-red-700",
  transition: "bg-blue-900/50 text-blue-300 border-blue-700",
  arrival: "bg-green-900/50 text-green-300 border-green-700",
  powers: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
};

export default function SidePanel({
  anime,
  selectedCategory,
  selectedAnimeId,
  onSelectAnime,
  onDeleteAnime,
  onClose,
}: SidePanelProps) {
  const selectedAnime = selectedAnimeId
    ? anime.find((a) => a.id === selectedAnimeId)
    : null;

  if (selectedAnime) {
    return (
      <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onSelectAnime(null)}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
          >
            ← Back to list
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{selectedAnime.title}</h2>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-400">Isekai Confidence:</span>
            <span
              className={`text-sm font-medium ${
                selectedAnime.confidence >= 0.7
                  ? "text-green-400"
                  : selectedAnime.confidence >= 0.3
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {Math.round(selectedAnime.confidence * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                selectedAnime.confidence >= 0.7
                  ? "bg-green-500"
                  : selectedAnime.confidence >= 0.3
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${selectedAnime.confidence * 100}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">{selectedAnime.explanation}</p>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3">Story Beats</h3>
        <div className="space-y-3 flex-1">
          {selectedAnime.beats.map((beat, i) => (
            <div
              key={beat.id || i}
              className={`p-3 rounded-lg border ${STAGE_COLORS[beat.stage]}`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-1">
                {STAGE_LABELS[beat.stage]}
              </div>
              <div className="text-sm font-medium mb-1">
                {beat.stage === "arrival" && beat.arrivalDetail
                  ? formatArrivalLabel(beat.arrivalDetail)
                  : beat.categoryId}
              </div>
              <div className="text-xs opacity-80">{beat.rawText}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (confirm(`Delete "${selectedAnime.title}" from the dataset?`)) {
              onDeleteAnime(selectedAnime.id);
            }
          }}
          className="mt-4 w-full py-2 px-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg hover:bg-red-900 text-sm"
        >
          Delete Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {selectedCategory
            ? `Anime with "${selectedCategory}"`
            : "All Analyzed Anime"}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      {anime.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No anime to display
        </div>
      ) : (
        <div className="space-y-2">
          {anime.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectAnime(a.id)}
              className="w-full px-3 py-2 text-left text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-gray-400">
                {a.beats.length} beats •{" "}
                {Math.round(a.confidence * 100)}% confidence
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
