"use client";

import { useState, useMemo } from "react";
import { AnalyzedAnime } from "@/types";

interface AnimeSearchProps {
  anime: AnalyzedAnime[];
  onSelect: (animeId: string) => void;
}

export default function AnimeSearch({ anime, onSelect }: AnimeSearchProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const results = useMemo(() => {
    if (query.length < 1) return [];
    return anime.filter((a) =>
      a.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, anime]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Search analyzed anime..."
        className="w-full px-3 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded-lg focus:border-purple-500 focus:outline-none placeholder-gray-400"
      />
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {results.map((a) => (
            <button
              key={a.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(a.id);
                setQuery("");
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
            >
              {a.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
