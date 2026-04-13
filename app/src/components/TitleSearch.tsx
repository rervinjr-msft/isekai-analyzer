"use client";

import { useState, useCallback, useEffect } from "react";
import { AniListSearchResult } from "@/types";

interface TitleSearchProps {
  onSelect: (result: AniListSearchResult) => void;
  disabled?: boolean;
}

export default function TitleSearch({ onSelect, disabled }: TitleSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AniListSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/anime/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300);
    return () => clearTimeout(timeout);
  }, [query, search]);

  const handleSelect = (result: AniListSearchResult) => {
    const title = result.title.english || result.title.romaji;
    setQuery(title);
    setShowDropdown(false);
    onSelect(result);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder="Search for an anime title..."
        disabled={disabled}
        className="w-full px-4 py-3 text-lg border-2 border-gray-600 bg-gray-800 text-white rounded-lg focus:border-purple-500 focus:outline-none disabled:opacity-50 placeholder-gray-400"
      />
      {loading && (
        <div className="absolute right-3 top-3.5">
          <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      )}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 border-b border-gray-700 last:border-b-0"
            >
              {r.coverImage?.medium && (
                <img
                  src={r.coverImage.medium}
                  alt=""
                  className="w-10 h-14 object-cover rounded"
                />
              )}
              <div>
                <div className="text-white font-medium">
                  {r.title.english || r.title.romaji}
                </div>
                {r.title.english && r.title.romaji !== r.title.english && (
                  <div className="text-gray-400 text-sm">{r.title.romaji}</div>
                )}
                {r.genres && (
                  <div className="text-gray-500 text-xs mt-0.5">
                    {r.genres.slice(0, 3).join(", ")}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      {showDropdown && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 text-gray-400 text-center">
          No anime found
        </div>
      )}
    </div>
  );
}
