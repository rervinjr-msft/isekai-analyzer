"use client";

import { useState } from "react";
import { AniListSearchResult, ClassificationResult, ExtractionResult, AnalyzedAnime, Beat, ExtractedBeat, formatArrivalLabel } from "@/types";
import { getCanonicalTitle } from "@/lib/anilist";
import TitleSearch from "./TitleSearch";

interface AnalysisFormProps {
  onAnalysisComplete: () => void;
}

function generateId(): string {
  return `anime-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AnalysisForm({ onAnalysisComplete }: AnalysisFormProps) {
  const [step, setStep] = useState<"search" | "classifying" | "classified" | "extracting" | "confirm" | "saving">("search");
  const [selectedAnime, setSelectedAnime] = useState<AniListSearchResult | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const title = selectedAnime
    ? selectedAnime.title.english || selectedAnime.title.romaji
    : "";

  const handleSelect = async (result: AniListSearchResult) => {
    setSelectedAnime(result);
    setError(null);
    setCached(false);
    setStep("classifying");

    try {
      const canonicalTitle = getCanonicalTitle(result);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anilistId: result.id, title: canonicalTitle }),
      });
      if (!res.ok) throw new Error("Analysis request failed");
      const data = await res.json();

      if (data.cached) {
        setCached(true);
        setStep("search");
        onAnalysisComplete();
        return;
      }

      if (data.rejected) {
        setClassification(data.classification);
        setStep("classified");
        return;
      }

      if (data.needsOverride) {
        setClassification(data.classification);
        setStep("classified");
        return;
      }

      if (data.classification && data.extraction) {
        setClassification(data.classification);
        setExtraction(data.extraction);
        setStep("confirm");
      }
    } catch {
      setError("Analysis failed. Please try again.");
      setStep("search");
    }
  };

  const handleOverride = async () => {
    if (!selectedAnime) return;
    setStep("extracting");
    setError(null);

    try {
      const canonicalTitle = getCanonicalTitle(selectedAnime);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anilistId: selectedAnime.id,
          title: canonicalTitle,
          override: true,
        }),
      });
      if (!res.ok) throw new Error("Analysis request failed");
      const data = await res.json();

      if (data.cached) {
        setCached(true);
        setStep("search");
        onAnalysisComplete();
        return;
      }

      if (data.classification && data.extraction) {
        setClassification(data.classification);
        setExtraction(data.extraction);
        setStep("confirm");
      }
    } catch {
      setError("Analysis failed. Please try again.");
      setStep("search");
    }
  };

  const handleConfirm = async () => {
    if (!selectedAnime || !classification || !extraction) return;
    setStep("saving");

    try {
      const canonicalTitle = getCanonicalTitle(selectedAnime);

      const beats: Beat[] = extraction.beats.map((b: ExtractedBeat, i: number) => ({
        id: `beat-${Date.now()}-${i}`,
        stage: b.stage,
        categoryId: b.categoryName,
        rawText: b.rawText,
        ...(b.arrivalDetail ? { arrivalDetail: b.arrivalDetail } : {}),
      }));

      const anime: AnalyzedAnime = {
        id: generateId(),
        anilistId: selectedAnime.id,
        title: canonicalTitle,
        beats,
        isIsekai: classification.isIsekai,
        confidence: classification.confidence,
        explanation: classification.explanation,
        analyzedAt: new Date().toISOString(),
      };

      const saveRes = await fetch("/api/anime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anime,
          newCategories: extraction.proposedCategories,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save anime");

      setStep("search");
      setSelectedAnime(null);
      setClassification(null);
      setExtraction(null);
      onAnalysisComplete();
    } catch {
      setError("Failed to save. Please try again.");
      setStep("confirm");
    }
  };

  const handleReset = () => {
    setStep("search");
    setSelectedAnime(null);
    setClassification(null);
    setExtraction(null);
    setError(null);
    setCached(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Analyze Anime</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {cached && (
        <div className="mb-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg text-blue-300 text-sm">
          This anime has already been analyzed. Showing existing data.
        </div>
      )}

      {step === "search" && (
        <TitleSearch onSelect={handleSelect} />
      )}

      {(step === "classifying" || step === "extracting") && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-400">
            {step === "classifying" ? "Analyzing..." : "Extracting story beats..."}
          </p>
          <p className="text-gray-500 text-sm mt-1">{title}</p>
        </div>
      )}

      {step === "classified" && classification && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                classification.isIsekai
                  ? "bg-green-900/50 text-green-300"
                  : "bg-red-900/50 text-red-300"
              }`}
            >
              {classification.isIsekai ? "✓ Isekai" : "✗ Not Isekai"}
            </div>
            <div className="text-gray-400 text-sm">
              {Math.round(classification.confidence * 100)}% confidence
            </div>
          </div>
          <p className="text-gray-300 text-sm">{classification.explanation}</p>

          <div className="flex gap-3">
            {!classification.isIsekai && (
              <button
                onClick={handleOverride}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Override & Analyze Anyway
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
            >
              Try Another
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && extraction && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-gray-400 text-sm">Review the extracted story beats:</p>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {extraction.beats.map((beat, i) => (
              <div
                key={i}
                className="p-3 bg-gray-700 rounded-lg border border-gray-600"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    {beat.stage}
                  </span>
                  <span className="text-sm text-white font-medium">
                    {beat.stage === "arrival" && beat.arrivalDetail
                      ? formatArrivalLabel(beat.arrivalDetail)
                      : beat.categoryName}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{beat.rawText}</p>
              </div>
            ))}
          </div>

          {extraction.proposedCategories.length > 0 && (
            <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-yellow-300 text-sm font-medium mb-1">New categories proposed:</p>
              {extraction.proposedCategories.map((pc, i) => (
                <span
                  key={i}
                  className="inline-block mr-2 mb-1 px-2 py-0.5 bg-yellow-900/50 text-yellow-300 text-xs rounded"
                >
                  [{pc.stage}] {pc.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              ✓ Confirm & Save
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "saving" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-3 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-400">Saving analysis...</p>
        </div>
      )}
    </div>
  );
}
