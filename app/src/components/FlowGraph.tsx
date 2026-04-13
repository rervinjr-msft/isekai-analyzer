"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnalyzedAnime, StoryStage, BeatCategory, formatArrivalLabel } from "@/types";

interface FlowGraphProps {
  anime: AnalyzedAnime[];
  categories: BeatCategory[];
  onNodeClick: (categoryName: string) => void;
  highlightedAnimeId: string | null;
  minAnimeCount: number;
  filterCategory: string;
}

const STAGE_Y: Record<StoryStage, number> = {
  departure: 0,
  transition: 200,
  arrival: 400,
  powers: 600,
};

const STAGE_COLORS: Record<StoryStage, string> = {
  departure: "#ef4444",
  transition: "#3b82f6",
  arrival: "#22c55e",
  powers: "#eab308",
};

const STAGE_BG: Record<StoryStage, string> = {
  departure: "#1a0505",
  transition: "#050a1a",
  arrival: "#051a0a",
  powers: "#1a1805",
};

function buildGraph(
  anime: AnalyzedAnime[],
  categories: BeatCategory[],
  highlightedAnimeId: string | null,
  minAnimeCount: number,
  filterCategory: string
) {
  // Build node data: count anime per category
  const nodeCounts = new Map<string, { count: number; name: string; stage: StoryStage }>();
  const edgeCounts = new Map<string, number>();

  // Track which anime go through which nodes
  const nodeAnime = new Map<string, Set<string>>();

  for (const a of anime) {
    const sortedBeats = [...a.beats].sort(
      (x, y) => STAGE_Y[x.stage] - STAGE_Y[y.stage]
    );

    let prevNodeId: string | null = null;
    for (const beat of sortedBeats) {
      let label: string;
      if (beat.stage === "arrival" && beat.arrivalDetail) {
        label = formatArrivalLabel(beat.arrivalDetail);
      } else {
        const cat = categories.find((c) => c.id === beat.categoryId);
        label = cat?.name || beat.categoryId;
      }

      const nodeId = `${beat.stage}-${label}`;
      const existing = nodeCounts.get(nodeId);
      if (existing) {
        existing.count++;
      } else {
        nodeCounts.set(nodeId, { count: 1, name: label, stage: beat.stage });
      }

      if (!nodeAnime.has(nodeId)) {
        nodeAnime.set(nodeId, new Set());
      }
      nodeAnime.get(nodeId)!.add(a.id);

      if (prevNodeId && prevNodeId !== nodeId) {
        const edgeId = `${prevNodeId}->${nodeId}`;
        edgeCounts.set(edgeId, (edgeCounts.get(edgeId) || 0) + 1);
      }
      prevNodeId = nodeId;
    }
  }

  // Get highlighted anime's path
  const highlightedNodes = new Set<string>();
  const highlightedEdges = new Set<string>();
  if (highlightedAnimeId) {
    const ha = anime.find((a) => a.id === highlightedAnimeId);
    if (ha) {
      const sortedBeats = [...ha.beats].sort(
        (x, y) => STAGE_Y[x.stage] - STAGE_Y[y.stage]
      );
      let prevNodeId: string | null = null;
      for (const beat of sortedBeats) {
        let label: string;
        if (beat.stage === "arrival" && beat.arrivalDetail) {
          label = formatArrivalLabel(beat.arrivalDetail);
        } else {
          const cat = categories.find((c) => c.id === beat.categoryId);
          label = cat?.name || beat.categoryId;
        }
        const nodeId = `${beat.stage}-${label}`;
        highlightedNodes.add(nodeId);
        if (prevNodeId) {
          highlightedEdges.add(`${prevNodeId}->${nodeId}`);
        }
        prevNodeId = nodeId;
      }
    }
  }

  // Build nodes
  const stageNodes = new Map<StoryStage, string[]>();
  const nodes: Node[] = [];

  for (const [nodeId, data] of nodeCounts) {
    if (data.count < minAnimeCount) continue;
    if (filterCategory && !data.name.toLowerCase().includes(filterCategory.toLowerCase())) continue;

    if (!stageNodes.has(data.stage)) {
      stageNodes.set(data.stage, []);
    }
    stageNodes.get(data.stage)!.push(nodeId);
  }

  // Position nodes
  for (const [stage, nodeIds] of stageNodes) {
    const totalWidth = (nodeIds.length - 1) * 250;
    const startX = -totalWidth / 2;
    nodeIds.forEach((nodeId, i) => {
      const data = nodeCounts.get(nodeId)!;
      const isHighlighted = highlightedAnimeId ? highlightedNodes.has(nodeId) : true;
      const size = Math.max(30, Math.min(80, data.count * 15 + 20));

      nodes.push({
        id: nodeId,
        position: { x: startX + i * 250, y: STAGE_Y[stage] },
        data: {
          label: `${data.name}\n(${data.count})`,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          background: isHighlighted ? STAGE_COLORS[stage] : STAGE_BG[stage],
          color: "white",
          border: `2px solid ${STAGE_COLORS[stage]}`,
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: `${Math.max(11, Math.min(14, 10 + data.count))}px`,
          fontWeight: "600",
          textAlign: "center" as const,
          width: `${Math.max(140, size * 2 + 60)}px`,
          opacity: isHighlighted ? 1 : 0.3,
          whiteSpace: "pre-wrap" as const,
          transition: "opacity 0.3s, background 0.3s",
        },
      });
    });
  }

  // Build edges
  const edges: Edge[] = [];
  for (const [edgeId, count] of edgeCounts) {
    const [source, target] = edgeId.split("->");
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);
    if (!sourceNode || !targetNode) continue;

    const isHighlighted = highlightedAnimeId ? highlightedEdges.has(edgeId) : true;
    edges.push({
      id: edgeId,
      source,
      target,
      style: {
        stroke: isHighlighted ? "#a855f7" : "#374151",
        strokeWidth: Math.max(1, Math.min(6, count)),
        opacity: isHighlighted ? 1 : 0.2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isHighlighted ? "#a855f7" : "#374151",
      },
      animated: isHighlighted && !!highlightedAnimeId,
    });
  }

  return { nodes, edges };
}

export default function FlowGraph({
  anime,
  categories,
  onNodeClick,
  highlightedAnimeId,
  minAnimeCount,
  filterCategory,
}: FlowGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(anime, categories, highlightedAnimeId, minAnimeCount, filterCategory),
    [anime, categories, highlightedAnimeId, minAnimeCount, filterCategory]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const label = (node.data.label as string).replace(/\n\(\d+\)$/, "");
      onNodeClick(label);
    },
    [onNodeClick]
  );

  // Stage labels
  const stageLabels = [
    { y: -40, label: "DEPARTURE", color: STAGE_COLORS.departure },
    { y: 160, label: "TRANSITION", color: STAGE_COLORS.transition },
    { y: 360, label: "ARRIVAL", color: STAGE_COLORS.arrival },
    { y: 560, label: "POWERS", color: STAGE_COLORS.powers },
  ];

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-gray-900"
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="#374151" gap={20} />
        <Controls className="!bg-gray-800 !border-gray-600 [&>button]:!bg-gray-800 [&>button]:!border-gray-600 [&>button]:!text-white [&>button:hover]:!bg-gray-700" />
        <Panel position="top-left" className="space-y-1">
          {stageLabels.map((sl) => (
            <div
              key={sl.label}
              className="text-xs font-bold tracking-widest px-2 py-1 rounded"
              style={{ color: sl.color }}
            >
              {sl.label}
            </div>
          ))}
        </Panel>
      </ReactFlow>
    </div>
  );
}
