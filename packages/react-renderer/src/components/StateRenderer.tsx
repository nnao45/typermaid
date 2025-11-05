import type { StateDiagram } from '@lyric-js/core';
import {
  computeUnifiedDagreLayout,
  measureTextCanvas,
  type UnifiedLayoutEdge,
  type UnifiedLayoutNode,
} from '@lyric-js/renderer-core';
import type React from 'react';
import { useMemo } from 'react';
import type { Theme } from '../themes/types';
import { ContentRenderer } from './ContentRenderer';

interface StateRendererProps {
  diagram: StateDiagram;
  theme: Theme;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const StateRenderer: React.FC<StateRendererProps> = ({
  diagram,
  theme,
  width = 800,
  height = 600,
}) => {
  const states = diagram.states || [];
  const transitions = diagram.transitions || [];

  // Font settings
  const labelFontSize = 14;
  const descFontSize = 10;
  const padding = 20;

  // Calculate state dimensions dynamically
  const stateData = useMemo(() => {
    return states.map((state) => {
      // Special sizes for START/END states (circles)
      if (state.type === 'START' || state.type === 'END') {
        return {
          state,
          width: 30,
          height: 30,
        };
      }

      const label = state.label || state.id;
      const labelText = typeof label === 'string' ? label : ''; // HTML content uses fixed size
      const descText = typeof state.description === 'string' ? state.description : '';

      const labelMetrics = labelText
        ? measureTextCanvas(labelText, labelFontSize, 'sans-serif', 'bold')
        : { width: 0, height: 0 };
      const descMetrics = descText
        ? measureTextCanvas(descText, descFontSize, 'sans-serif', 'normal')
        : { width: 0, height: 0 };

      const stateWidth = Math.max(labelMetrics.width, descMetrics.width) + padding * 2;
      const stateHeight = labelMetrics.height + descMetrics.height + padding * 2;

      return {
        state,
        width: Math.max(stateWidth, 140),
        height: Math.max(stateHeight, 60),
      };
    });
  }, [states]);

  // Prepare nodes and edges for Dagre layout
  const layout = useMemo(() => {
    const nodes: UnifiedLayoutNode[] = stateData.map(({ state, width, height }) => ({
      id: state.id,
      label: (typeof state.label === 'string' ? state.label : state.id) || state.id,
      width,
      height,
    }));

    const edges: UnifiedLayoutEdge[] = transitions
      .map((trans): UnifiedLayoutEdge | null => {
        const label = typeof trans.label === 'string' ? trans.label : undefined;
        if (label === undefined) {
          return {
            from: trans.from,
            to: trans.to,
          };
        }
        return {
          from: trans.from,
          to: trans.to,
          label,
        };
      })
      .filter((edge): edge is UnifiedLayoutEdge => edge !== null);

    return computeUnifiedDagreLayout(nodes, edges, {
      rankdir: 'LR', // State machines typically flow left-to-right
      ranksep: 80,
      nodesep: 60,
      marginx: 80,
      marginy: 80,
    });
  }, [stateData, transitions]);

  // Generate path from points (polyline routing)
  const generatePath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    if (!first) return '';
    const pathParts = [`M ${first.x} ${first.y}`];
    for (const point of rest) {
      pathParts.push(`L ${point.x} ${point.y}`);
    }
    return pathParts.join(' ');
  };

  return (
    <svg
      width={Math.max(width, layout.width)}
      height={Math.max(height, layout.height)}
      style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.background }}
    >
      {/* Render states with Dagre positions */}
      {stateData.map(({ state, width: stateWidth, height: stateHeight }) => {
        const position = layout.nodes.find((n) => n.id === state.id);
        if (!position) return null;

        const isStart = state.type === 'START';
        const isEnd = state.type === 'END';

        if (isStart || isEnd) {
          return (
            <circle
              key={state.id}
              cx={position.x}
              cy={position.y}
              r={15}
              fill={isStart ? theme.colors.node.stroke : theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={isEnd ? 4 : 2}
            />
          );
        }

        const x = position.x - stateWidth / 2;
        const y = position.y - stateHeight / 2;

        return (
          <g key={state.id}>
            <rect
              x={x}
              y={y}
              width={stateWidth}
              height={stateHeight}
              fill={theme.colors.node.fill}
              stroke={theme.colors.node.stroke}
              strokeWidth={2}
              rx={8}
            />
            {state.label ? (
              typeof state.label === 'string' ? (
                <text
                  x={position.x}
                  y={position.y}
                  fill={theme.colors.text}
                  fontSize={14}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {state.label}
                </text>
              ) : (
                <ContentRenderer
                  content={state.label}
                  x={position.x}
                  y={position.y}
                  width={stateWidth - 10}
                  height={30}
                />
              )
            ) : (
              <text
                x={position.x}
                y={position.y}
                fill={theme.colors.text}
                fontSize={14}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {state.id}
              </text>
            )}
            {state.description &&
              (typeof state.description === 'string' ? (
                <text
                  x={position.x}
                  y={position.y + 15}
                  fill={theme.colors.text}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {state.description}
                </text>
              ) : (
                <ContentRenderer
                  content={state.description}
                  x={position.x}
                  y={position.y + 15}
                  width={stateWidth - 10}
                  height={20}
                />
              ))}
          </g>
        );
      })}

      {/* Render transitions with Dagre-routed edges */}
      {layout.edges.map((edge, index) => {
        const transition = transitions.find((t) => t.from === edge.from && t.to === edge.to);
        if (!transition) return null;

        const pathData = generatePath(edge.points);
        const midPoint = edge.points[Math.floor(edge.points.length / 2)];
        if (!midPoint) return null;

        return (
          <g key={`${edge.from}-${edge.to}-${index}`}>
            <path
              d={pathData}
              fill="none"
              stroke={theme.colors.edge.stroke}
              strokeWidth={2}
              markerEnd="url(#arrowhead-state)"
            />
            {transition.label &&
              (typeof transition.label === 'string' ? (
                <text
                  x={midPoint.x}
                  y={midPoint.y - 5}
                  fill={theme.colors.text}
                  fontSize={11}
                  textAnchor="middle"
                >
                  {transition.label}
                </text>
              ) : (
                <ContentRenderer
                  content={transition.label}
                  x={midPoint.x}
                  y={midPoint.y - 5}
                  width={120}
                  height={25}
                />
              ))}
          </g>
        );
      })}

      <defs>
        <marker
          id="arrowhead-state"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={theme.colors.edge.stroke} />
        </marker>
      </defs>
    </svg>
  );
};
